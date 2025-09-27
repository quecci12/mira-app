package com.quecci.miraapp

import android.content.Context
import android.graphics.Bitmap
import android.graphics.ImageFormat
import android.graphics.PixelFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.media.Image
import androidx.camera.core.ImageProxy
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer

class YuvToRgbConverter(private val context: Context) {
    fun yuvToRgb(image: Image, output: Bitmap) {
        val yBuffer = image.planes[0].buffer // Y
        val uBuffer = image.planes[1].buffer // U
        val vBuffer = image.planes[2].buffer // V

        val ySize = yBuffer.remaining()
        val uSize = uBuffer.remaining()
        val vSize = vBuffer.remaining()

        val nv21 = ByteArray(ySize + uSize + vSize)

        // Copy Y data
        yBuffer.get(nv21, 0, ySize)

        // Interleave U and V data
        val chromaRowStride = image.planes[1].rowStride
        val chromaRowPadding = chromaRowStride - image.width / 2

        var offset = ySize
        for (i in 0 until image.height / 2) {
            for (j in 0 until image.width / 2) {
                nv21[offset++] = vBuffer.get(i * chromaRowStride + j)
                nv21[offset++] = uBuffer.get(i * chromaRowStride + j)
            }
            vBuffer.position(vBuffer.position() + chromaRowPadding)
            uBuffer.position(uBuffer.position() + chromaRowPadding)
        }

        val yuvImage = YuvImage(nv21, ImageFormat.NV21, image.width, image.height, null)
        val out = ByteArrayOutputStream()
        yuvImage.compressToJpeg(Rect(0, 0, image.width, image.height), 100, out)
        val jpegBytes = out.toByteArray()

        val bmp = android.graphics.BitmapFactory.decodeByteArray(jpegBytes, 0, jpegBytes.size)
        val scaled = Bitmap.createScaledBitmap(bmp, output.width, output.height, true)
        output.eraseColor(0)
        val canvas = android.graphics.Canvas(output)
        canvas.drawBitmap(scaled, 0f, 0f, null)
    }
}
