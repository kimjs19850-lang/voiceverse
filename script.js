// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDEfI30f12aodrYPV1WaKvussIZGeeYWig",
  authDomain: "voiceverse-ad010.firebaseapp.com",
  projectId: "voiceverse-ad010",
  storageBucket: "voiceverse-ad010.firebasestorage.app",
  messagingSenderId: "377567305141",
  appId: "1:377567305141:web:1a89156faa0706d578cdfc",
  measurementId: "G-487F8C7FH8"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

const uploadBtn = document.getElementById('uploadBtn');
const audioFileInput = document.getElementById('audioFile');
const nicknameInput = document.getElementById('nickname');
const regionSelect = document.getElementById('region');
const statusDiv = document.getElementById('status');
const voicesDiv = document.getElementById('voices');

uploadBtn.addEventListener('click', async () => {
  const file = audioFileInput.files[0];
  const nickname = nicknameInput.value.trim();
  const region = regionSelect.value;

  if (!file || !nickname) {
    statusDiv.innerText = '⚠️ 닉네임과 음성파일을 모두 입력하세요.';
    return;
  }

  const fileRef = storage.ref().child(`voices/${Date.now()}_${file.name}`);
  statusDiv.innerText = '⏳ 업로드 중...';

  try {
    // Firebase Storage 업로드
    await fileRef.put(file);
    const url = await fileRef.getDownloadURL();

    // Firestore에 메타데이터 저장
    await db.collection('voices').add({
      nickname,
      region,
      audioUrl: url,
      timestamp: new Date(),
    });

    statusDiv.innerText = '✅ 업로드 완료!';
    audioFileInput.value = '';
    nicknameInput.value = '';
    loadVoices();
  } catch (err) {
    console.error(err);
    statusDiv.innerText = '❌ 업로드 실패. 다시 시도해주세요.';
  }
});

async function loadVoices() {
  voicesDiv.innerHTML = '';
  const snapshot = await db.collection('voices').orderBy('timestamp', 'desc').limit(10).get();
  snapshot.forEach(doc => {
    const v = doc.data();
    const card = document.createElement('div');
    card.className = 'voice-card';
    card.innerHTML = `
      <strong>${v.nickname}</strong> (${v.region})
      <br>
      <audio controls src="${v.audioUrl}"></audio>
      <br>
      <small>${new Date(v.timestamp.seconds * 1000).toLocaleString()}</small>
    `;
    voicesDiv.appendChild(card);
  });
}

loadVoices();
