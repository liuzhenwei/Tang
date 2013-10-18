package org.lzw.lyrics.tang;

import android.os.Bundle;
import android.app.Activity;
import org.apache.cordova.*;

public class MainActivity extends DroidGap {
   @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("loadUrlTimeoutValue", 60000);
        super.loadUrl("file:///android_asset/www/home.html");
    }
}
