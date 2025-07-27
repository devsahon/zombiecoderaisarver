package com.yourdomain.aiapp.ui;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.widget.TextView;
import android.widget.Button;
import com.yourdomain.aiapp.R;
import java.util.Locale;

public class DocPlayActivity extends Activity implements TextToSpeech.OnInitListener {
    private TextToSpeech tts;
    private TextView docTextView;
    private Button playBtn, stopBtn;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_doc_play);
        docTextView = findViewById(R.id.doc_text);
        playBtn = findViewById(R.id.btn_play);
        stopBtn = findViewById(R.id.btn_stop);
        tts = new TextToSpeech(this, this);
        // TODO: Load documentation text from intent
        playBtn.setOnClickListener(v -> speakDoc());
        stopBtn.setOnClickListener(v -> stopSpeaking());
    }
    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            tts.setLanguage(Locale.US);
        }
    }
    private void speakDoc() {
        String text = docTextView.getText().toString();
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null);
    }
    private void stopSpeaking() {
        if (tts != null) tts.stop();
    }
    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
} 