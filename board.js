// firebase-app-compat.js 와 firebase-firestore-compat.js 가 먼저 로드되어야 합니다

// 전달해주신 Firebase 설정 정보
const firebaseConfig = {
    apiKey: "AIzaSyC6tlVVRsGZuT5zRz9VPbrRA8HPWM5wFNU",
    authDomain: "my-company-web-721.firebaseapp.com",
    projectId: "my-company-web-721",
    storageBucket: "my-company-web-721.firebasestorage.app",
    messagingSenderId: "180154682292",
    appId: "1:180154682292:web:42417f0b1628db7a37c0e1"
};

// 파이어베이스 초기화 및 파이어스토어(DB) 연결
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentReadId = null;
let currentPostData = null;

// 날짜 포맷팅 함수
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
}

// 화면 전환 함수들
window.showList = function() {
    document.getElementById('view-list').style.display = 'block';
    document.getElementById('view-read').style.display = 'none';
    document.getElementById('view-write').style.display = 'none';
    currentReadId = null;
    currentPostData = null;
};

window.showWrite = function() {
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('view-read').style.display = 'none';
    document.getElementById('view-write').style.display = 'block';
    
    // 입력폼 초기화
    document.getElementById('write-title').value = '';
    document.getElementById('write-author').value = '';
    document.getElementById('write-password').value = '';
    document.getElementById('write-content').value = '';
};

window.readPost = function(id, data) {
    currentReadId = id;
    currentPostData = data;
    
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('view-read').style.display = 'block';
    document.getElementById('view-write').style.display = 'none';
    
    document.getElementById('read-title').textContent = data.title;
    document.getElementById('read-author').textContent = data.author;
    document.getElementById('read-date').textContent = formatDate(data.createdAt.toDate());
    document.getElementById('read-likes').textContent = data.likes || 0;
    document.getElementById('read-likes-btn').textContent = data.likes || 0;
    document.getElementById('read-content').textContent = data.content;

    // 댓글 불러오기 연동
    loadComments(id);
};

// 게시글 작성 (Firestore에 저장)
window.savePost = function() {
    const title = document.getElementById('write-title').value.trim();
    const author = document.getElementById('write-author').value.trim();
    const password = document.getElementById('write-password').value.trim();
    const content = document.getElementById('write-content').value.trim();
    
    if (!title || !author || !password || !content) {
        alert("모든 항목을 입력해주세요.");
        return;
    }
    
    db.collection("posts").add({
        title: title,
        author: author,
        password: password, // 실제 서비스에서는 암호화(해싱) 저장이 권장됩니다
        content: content,
        likes: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("글이 성공적으로 등록되었습니다.");
        showList();
    }).catch((error) => {
        console.error("게시글 저장 오류:", error);
        alert("등록 중 오류가 발생했습니다.");
    });
};

// 게시글 목록 실시간 불러오기 (Firestore onSnapshot)
db.collection("posts").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
    const tbody = document.getElementById("board-tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    if (snapshot.empty) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 30px; color: #64748b;">등록된 게시글이 없습니다.</td></tr>`;
        return;
    }
    
    let index = snapshot.size;
    snapshot.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        // createdAt이 아직 서버에 안 찍힌 상태 처리
        const dateStr = data.createdAt ? formatDate(data.createdAt.toDate()) : '방금 전';
        
        const tr = document.createElement("tr");
        
        tr.innerHTML = `
            <td>${index}</td>
            <td class="title">${data.title}</td>
            <td>${data.author}</td>
            <td>${dateStr}</td>
            <td>${data.likes || 0}</td>
        `;
        
        // 제목 클릭 이벤트
        tr.querySelector('.title').addEventListener('click', () => {
            readPost(id, data);
        });
        
        tbody.appendChild(tr);
        index--;
    });
});

// 게시글 삭제
window.deletePostPrompt = function() {
    if (!currentReadId || !currentPostData) return;
    
    const inputPw = prompt("게시글 작성 시 입력한 비밀번호를 입력해주세요.");
    if (inputPw === null) return; // 취소 누름
    
    if (inputPw === currentPostData.password) {
        if(confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            db.collection("posts").doc(currentReadId).delete().then(() => {
                alert("삭제되었습니다.");
                showList();
            }).catch((error) => {
                console.error("삭제 오류:", error);
                alert("삭제 중 오류가 발생했습니다.");
            });
        }
    } else {
        alert("비밀번호가 일치하지 않습니다.");
    }
};

// 게시글 추천하기
window.likePost = function() {
    if (!currentReadId) return;
    
    const postRef = db.collection("posts").doc(currentReadId);
    
    // likes 필드를 1 증가시킴 (원자적 연산)
    postRef.update({
        likes: firebase.firestore.FieldValue.increment(1)
    }).then(() => {
        alert("추천되었습니다!");
        // UI 즉시 업데이트 (목록은 onSnapshot으로 자동 갱신됨)
        const newLikes = (currentPostData.likes || 0) + 1;
        currentPostData.likes = newLikes; 
        document.getElementById('read-likes').textContent = newLikes;
        document.getElementById('read-likes-btn').textContent = newLikes;
    }).catch((error) => {
        console.error("추천 오류:", error);
        alert("추천 처리 중 오류가 발생했습니다.");
    });
};

/* ==========================================================
   댓글 (Comments) 관련 로직
   ========================================================== */

// 댓글 실시간 감지용 unsubscribe 함수
let unsubscribeComments = null;

// 댓글 불러오기
window.loadComments = function(postId) {
    const commentListDiv = document.getElementById("comment-list");
    const commentCountSpan = document.getElementById("comment-count");
    
    // 이전 게시글의 댓글 감지 중지
    if (unsubscribeComments) {
        unsubscribeComments();
    }
    
    commentListDiv.innerHTML = "<p style='color:#64748b; padding: 20px 0;'>댓글을 불러오는 중...</p>";
    
    const commentsRef = db.collection("posts").doc(postId).collection("comments");
    
    // 실시간 댓글 감지
    unsubscribeComments = commentsRef.orderBy("createdAt", "asc").onSnapshot((snapshot) => {
        commentListDiv.innerHTML = "";
        commentCountSpan.textContent = snapshot.size;
        
        if (snapshot.empty) {
            commentListDiv.innerHTML = "<p style='color:#64748b; padding: 20px 0; border-bottom: 1px solid #e2e8f0;'>첫 댓글을 남겨보세요!</p>";
            return;
        }
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const commentId = doc.id;
            const dateStr = data.createdAt ? formatDate(data.createdAt.toDate()) : '방금 전';
            
            const div = document.createElement("div");
            div.style.padding = "15px 0";
            div.style.borderBottom = "1px solid #e2e8f0";
            
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <strong style="color: #1e293b; font-size: 1.05rem;">${data.author}</strong>
                    <span style="color: #94a3b8; font-size: 0.9rem;">${dateStr}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <p style="color: #475569; margin: 0; line-height: 1.5; white-space: pre-wrap; flex: 1;">${data.content}</p>
                    <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem; margin-left: 15px;" onclick="deleteCommentPrompt('${commentId}', '${data.password}')">삭제</button>
                </div>
            `;
            commentListDiv.appendChild(div);
        });
    });
};

// 댓글 작성하기
window.saveComment = function() {
    if (!currentReadId) return;
    
    const author = document.getElementById('comment-author').value.trim();
    const password = document.getElementById('comment-password').value.trim();
    const content = document.getElementById('comment-content').value.trim();
    
    if (!author || !password || !content) {
        alert("이름, 비밀번호, 내용을 모두 입력해주세요.");
        return;
    }
    
    const commentsRef = db.collection("posts").doc(currentReadId).collection("comments");
    
    commentsRef.add({
        author: author,
        password: password,
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        // 입력폼 초기화
        document.getElementById('comment-author').value = '';
        document.getElementById('comment-password').value = '';
        document.getElementById('comment-content').value = '';
    }).catch((error) => {
        console.error("댓글 저장 오류:", error);
        alert("댓글 등록 중 오류가 발생했습니다.");
    });
};

// 댓글 삭제하기
window.deleteCommentPrompt = function(commentId, correctPassword) {
    if (!currentReadId) return;
    
    const inputPw = prompt("댓글 작성 시 입력한 비밀번호를 입력해주세요.");
    if (inputPw === null) return;
    
    if (inputPw === correctPassword) {
        if(confirm("이 댓글을 삭제하시겠습니까?")) {
            db.collection("posts").doc(currentReadId).collection("comments").doc(commentId).delete().then(() => {
                alert("댓글이 삭제되었습니다.");
            }).catch((error) => {
                console.error("댓글 삭제 오류:", error);
                alert("댓글 삭제 중 오류가 발생했습니다.");
            });
        }
    } else {
        alert("비밀번호가 일치하지 않습니다.");
    }
};

// 초기 설정
document.addEventListener("DOMContentLoaded", function() {
    showList();
});
