// 在页面绘制前应用用户选过的深浅色，避免闪烁
try {
  var t = localStorage.getItem('zw-theme');
  if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
} catch (e) { /* 存储不可用时跟随系统 */ }
