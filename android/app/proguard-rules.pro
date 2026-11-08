# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# llama.rn documents this keep rule for minified Android release builds.
# Its JNI module classes are looked up by the native bridge at runtime.
-keep class com.rnllama.** { *; }

# HardwareInfoModule exposes nativePurgeAll through a name-based JNI symbol
# (Java_com_pocketpal_HardwareInfoModule_nativePurgeAll). Keep both the
# declaring class and native method name stable in minified release builds.
-keep class com.pocketpal.HardwareInfoModule {
    private native boolean nativePurgeAll();
}
