// ============================================================
// CHALDEA SUMMON SIMULATOR — PWA 앱 설치 & 서비스 워커 컨트롤러 (pwa.js)
// Chrome/Edge/Android 원클릭 앱 설치 + iOS Safari 홈 화면 추가 안내 지원
// ============================================================
(function () {
  let deferredPrompt = null;

  function isStandalone() {
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true
    );
  }

  function isIosSafari() {
    const ua = window.navigator.userAgent || '';
    const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    return isIos && isSafari;
  }

  function isSecureOrigin() {
    return (
      location.protocol === 'https:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1'
    );
  }

  function notify(msg) {
    if (typeof window.showChaldeaToast === 'function') {
      window.showChaldeaToast(msg);
    } else {
      alert(msg);
    }
  }

  function updateInstallUI() {
    const headerBtns = document.querySelectorAll('.btn-pwa-install');
    const statusEl = document.getElementById('pwa-install-status');
    const settingsBtn = document.getElementById('btn-settings-pwa-install');

    if (isStandalone()) {
      headerBtns.forEach(b => b.classList.add('hidden'));
      if (statusEl) statusEl.textContent = '✅ 설치된 앱(스탠드얼론) 모드로 실행 중입니다!';
      if (settingsBtn) {
        settingsBtn.textContent = '✅ 앱 설치 완료';
        settingsBtn.disabled = true;
      }
      return;
    }

    if (deferredPrompt) {
      headerBtns.forEach(b => {
        b.classList.remove('hidden');
        b.textContent = '📲 앱 설치';
      });
      if (statusEl) statusEl.textContent = '✨ 지금 바로 기기에 칼데아 가챠 앱을 설치할 수 있습니다!';
      if (settingsBtn) {
        settingsBtn.textContent = '📲 지금 바로 앱 설치하기';
        settingsBtn.disabled = false;
      }
    } else if (isIosSafari()) {
      headerBtns.forEach(b => {
        b.classList.remove('hidden');
        b.textContent = '📲 홈 화면 추가';
      });
      if (statusEl) statusEl.textContent = '📱 iOS Safari: 하단 [공유 ⬆️] → [홈 화면에 추가]로 앱처럼 설치하세요!';
      if (settingsBtn) {
        settingsBtn.textContent = '📱 iOS 설치 방법 보기';
        settingsBtn.disabled = false;
      }
    } else if (!isSecureOrigin()) {
      headerBtns.forEach(b => {
        b.classList.remove('hidden');
        b.textContent = '📲 앱 설치';
      });
      if (statusEl) statusEl.textContent = 'ℹ️ 현재 로컬 파일(file://)로 열려 있습니다. HTTPS 또는 localhost 서버로 열면 원클릭 앱 설치가 활성화됩니다.';
      if (settingsBtn) {
        settingsBtn.textContent = '📲 앱 설치 안내 보기';
        settingsBtn.disabled = false;
      }
    } else {
      headerBtns.forEach(b => {
        b.classList.remove('hidden');
        b.textContent = '📲 앱 설치';
      });
      if (statusEl) statusEl.textContent = '📲 브라우저 주소창 오른쪽 [설치(⊕)] 아이콘 또는 아래 버튼으로 설치할 수 있습니다.';
      if (settingsBtn) {
        settingsBtn.textContent = '📲 앱 설치하기';
        settingsBtn.disabled = false;
      }
    }
  }

  async function triggerInstall() {
    if (isStandalone()) {
      notify('✅ 이미 설치된 앱 모드로 실행 중입니다!');
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      updateInstallUI();
      if (outcome === 'accepted') {
        notify('🎉 칼데아 가챠 앱 설치가 시작되었습니다! 바탕화면/홈 화면에서 바로 실행하세요.');
      }
      return;
    }

    if (isIosSafari()) {
      notify("📱 iOS 앱 설치: Safari 하단 [공유 ⬆️] 버튼을 누른 뒤 ['홈 화면에 추가']를 선택하세요!");
      return;
    }

    if (!isSecureOrigin()) {
      notify('📲 앱 설치(PWA)는 HTTPS 웹 주소(GitHub Pages 등) 또는 localhost에서 열었을 때 원클릭 설치 팝업이 활성화됩니다!');
      return;
    }

    notify('📲 브라우저 주소창 오른쪽 [앱 설치(⊕)] 아이콘 또는 메뉴 → [앱 설치 / 홈 화면에 추가]를 선택해 주세요!');
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    updateInstallUI();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateInstallUI();
    notify('🎉 CHALDEA SUMMON 앱 설치 완료! 이제 오프라인에서도 플레이할 수 있습니다.');
  });

  if ('serviceWorker' in navigator && isSecureOrigin()) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn('SW registration skipped:', err);
      });
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    updateInstallUI();
    document.querySelectorAll('.btn-pwa-install, #btn-settings-pwa-install').forEach(btn => {
      btn.addEventListener('click', triggerInstall);
    });
  });

  window.PwaInstaller = {
    install: triggerInstall,
    isStandalone,
    refresh: updateInstallUI
  };
})();
