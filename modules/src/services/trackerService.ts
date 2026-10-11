import { initLlama } from 'llama.rn';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

// Store the context globally so we don't reload the 350MB model on every button press
let llamaContext: any = null;

export async function setupNoetexEngine() {
  if (llamaContext) return llamaContext;

  try {
    // 1. Tell Expo to find the bundled AI file
    const asset = Asset.fromModule(require('../../assets/models/noetex_0_5b.gguf'));
    await asset.downloadAsync(); 

    // 2. Define the exact path in the Android sandboxed storage
    const modelPath = `${FileSystem.documentDirectory}noetex_0_5b.gguf`;

    // 3. Extract the file if it hasn't been copied yet
    const fileInfo = await FileSystem.getInfoAsync(modelPath);
    if (!fileInfo.exists) {
      await FileSystem.copyAsync({
        from: asset.localUri || asset.uri,
        to: modelPath,
      });
    }

    // 4. Boot up the local C++ AI engine
    llamaContext = await initLlama({
      model: modelPath,
      n_ctx: 1024,
      n_gpu_layers: 0, // Forces it to run safely on the Realme C3 CPU
    });

    return llamaContext;
  } catch (error) {
    console.error("Failed to boot Noetex Engine:", error);
    throw error;
  }
}

export async function generateCBTReport(telemetryData: any) {
  // Ensure the engine is running
  const ctx = await setupNoetexEngine();
  
  // Feed the native telemetry directly into the local model
  const result = await ctx.completion({
    prompt: `System: You are Noetex, an empathetic CBT cognitive assistant. Provide concise, 3-sentence habit-breaking insights based on screen time.\n\nUser: My usage today is ${JSON.stringify(telemetryData)}\nAssistant:`,
    n_predict: 128,
  });

  return result.text;
}