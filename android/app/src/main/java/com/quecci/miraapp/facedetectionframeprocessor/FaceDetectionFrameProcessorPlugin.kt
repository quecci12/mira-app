package com.quecci.miraapp.facedetectionframeprocessor

import android.graphics.Bitmap
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.quecci.miraapp.FaceDetectionModule
import android.util.Log
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
class FaceDetectionFrameProcessorPlugin(
    proxy: VisionCameraProxy?,
    options: Map<String, Any>?
) : FrameProcessorPlugin() {

    override fun callback(frame: Frame, params: Map<String, Any>?): Any? {
        val imageProxy = frame.getImageProxy() // <-- helper VisionCamera usually provides
        if (imageProxy != null) {
            FaceDetectionModule.instance?.processImageProxy(imageProxy)
        }
        return null
    }
}
