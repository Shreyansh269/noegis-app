package expo.modules.noegisusage

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NoegisUsageModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("NoegisUsage")

    // true when the user has granted "Usage access" to this app
    Function("hasUsageAccess") {
      hasUsageAccess()
    }

    // opens Settings > Usage access (the app's own page when the phone supports it)
    Function("openUsageAccessSettings") {
      openUsageAccessSettings()
    }

    // foreground sessions between two epoch-millisecond timestamps
    AsyncFunction("getSessions") { startMs: Double, endMs: Double ->
      getSessions(startMs.toLong(), endMs.toLong())
    }
  }

  private fun hasUsageAccess(): Boolean {
    val ctx = context
    val appOps = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName
      )
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName
      )
    }
    return if (mode == AppOpsManager.MODE_DEFAULT) {
      ctx.checkCallingOrSelfPermission(android.Manifest.permission.PACKAGE_USAGE_STATS) ==
        PackageManager.PERMISSION_GRANTED
    } else {
      mode == AppOpsManager.MODE_ALLOWED
    }
  }

  private fun openUsageAccessSettings() {
    val ctx = context
    try {
      val specific = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        data = Uri.parse("package:${ctx.packageName}")
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      ctx.startActivity(specific)
    } catch (e: Exception) {
      val generic = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(generic)
    }
  }

  private fun ignoredPackages(ctx: Context): Set<String> {
    val set = hashSetOf(ctx.packageName, "com.android.systemui", "android")
    val home = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
    ctx.packageManager.queryIntentActivities(home, 0).forEach {
      set.add(it.activityInfo.packageName)
    }
    return set
  }

  @Suppress("DEPRECATION")
  private fun labelFor(ctx: Context, pkg: String, cache: HashMap<String, String>): String =
    cache.getOrPut(pkg) {
      try {
        val pm = ctx.packageManager
        pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
      } catch (e: Exception) {
        pkg
      }
    }

  // Android 8+ lets apps declare a category; games report CATEGORY_GAME
  @Suppress("DEPRECATION")
  private fun isGame(ctx: Context, pkg: String, cache: HashMap<String, Boolean>): Boolean =
    cache.getOrPut(pkg) {
      try {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
          ctx.packageManager.getApplicationInfo(pkg, 0).category == ApplicationInfo.CATEGORY_GAME
      } catch (e: Exception) {
        false
      }
    }

  /**
   * Walks the usage event stream and turns resume/pause events into sessions.
   * Only one app is treated as foreground at a time. A session closes when another
   * app comes forward, the app goes to background, the screen turns off or locks,
   * or the launcher / system UI takes over.
   */
  @Suppress("DEPRECATION")
  private fun getSessions(startMs: Long, endMs: Long): List<Map<String, Any>> {
    if (!hasUsageAccess()) return emptyList()

    val ctx = context
    val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val events = usm.queryEvents(startMs, endMs)
    val event = UsageEvents.Event()
    val ignored = ignoredPackages(ctx)
    val labels = HashMap<String, String>()
    val gameFlags = HashMap<String, Boolean>()
    val sessions = ArrayList<Map<String, Any>>()

    var curPkg: String? = null
    var curStart = 0L
    var firstEvent = true

    fun close(at: Long) {
      val pkg = curPkg ?: return
      if (at > curStart) {
        sessions.add(
          mapOf(
            "packageName" to pkg,
            "label" to labelFor(ctx, pkg, labels),
            "isGame" to isGame(ctx, pkg, gameFlags),
            "start" to curStart.toDouble(),
            "end" to at.toDouble()
          )
        )
      }
      curPkg = null
    }

    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      val pkg = event.packageName ?: continue
      val ts = event.timeStamp

      when (event.eventType) {
        // MOVE_TO_FOREGROUND is the same value as ACTIVITY_RESUMED on API 29+
        UsageEvents.Event.MOVE_TO_FOREGROUND -> {
          if (pkg in ignored) {
            close(ts)
          } else if (curPkg != pkg) {
            close(ts)
            curPkg = pkg
            curStart = ts
          }
        }
        // MOVE_TO_BACKGROUND is the same value as ACTIVITY_PAUSED on API 29+
        UsageEvents.Event.MOVE_TO_BACKGROUND -> {
          if (curPkg == pkg) {
            close(ts)
          } else if (firstEvent && curPkg == null && pkg !in ignored) {
            // app was already in the foreground when the window began
            curPkg = pkg
            curStart = startMs
            close(ts)
          }
        }
        // 16 = SCREEN_NON_INTERACTIVE (screen off), 17 = KEYGUARD_SHOWN (locked)
        16, 17 -> close(ts)
      }
      firstEvent = false
    }

    // still in the foreground right now
    if (curPkg != null) close(endMs)

    return sessions
  }
}
