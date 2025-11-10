
package com.eenadupratibha.pageflip

import android.graphics.Color
import androidx.viewpager2.widget.ViewPager2
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableArray
import kotlin.math.abs

class NativePageFlipManager : SimpleViewManager<ViewPager2>() {

    override fun getName(): String = "NativePageFlip"

    override fun createViewInstance(reactContext: ThemedReactContext): ViewPager2 {
        val pager = ViewPager2(reactContext).apply {
            setBackgroundColor(Color.WHITE)
            clipToPadding = false
            clipChildren = false
            offscreenPageLimit = 2
        }

        pager.adapter = PageFlipAdapter(reactContext)

        pager.setPageTransformer { page, position ->
            val pageWidth = page.width
            page.cameraDistance = pageWidth * 20f
            page.setBackgroundColor(Color.WHITE)

            when {
                position < -1 -> page.alpha = 0f
                position <= 0 -> {
                    // 👉 RIGHT → LEFT flip (Next Page)
                    // LEFT edge fixed, RIGHT edge moves toward user (clockwise)
                    page.alpha = 1f
                    page.pivotX = 0f // left edge fixed
                    page.pivotY = page.height / 2f

                    // Counteract ViewPager’s scroll movement
                    page.translationX = -position * pageWidth

                    // Rotate clockwise around left edge
                    page.rotationY = -180f * abs(position)

                    // Add slight depth & fade
                    page.translationZ = -abs(position) * 150f
                    page.alpha = 1f - (abs(position) * 0.2f)
                }

                position <= 1 -> {
                    // 👈 LEFT → RIGHT flip (Previous Page)
                    // RIGHT edge fixed, LEFT edge moves toward user (anti-clockwise)
                    page.alpha = 1f
                    page.pivotX = pageWidth.toFloat() // right edge fixed
                    page.pivotY = page.height / 2f

                    // Counteract ViewPager’s default scroll
                    page.translationX = -position * pageWidth

                    // Rotate anti-clockwise around right edge
                    page.rotationY = 180f * abs(position)

                    // Depth + fade for realism
                    page.translationZ = -abs(position) * 150f
                    page.alpha = 1f - (abs(position) * 0.2f)
                }

                else -> page.alpha = 0f
            }
        }

        return pager
    }

    @ReactProp(name = "pdfUrl")
    fun setPdfUrl(pager: ViewPager2, pdfUrl: String) {
        // (optional future use)
    }

    @ReactProp(name = "imageUrls")
    fun setImageUrls(pager: ViewPager2, imageUrls: ReadableArray) {
        val urls = mutableListOf<String>()
        for (i in 0 until imageUrls.size()) {
            urls.add(imageUrls.getString(i) ?: "")
        }
        (pager.adapter as? PageFlipAdapter)?.setImageUrls(urls)
    }
}

