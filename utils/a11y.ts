function outlineWatcher(): void {
  try {
    let previousAction = '';

    document.addEventListener('mousedown', () => {
      if (previousAction === 'mousedown') {
        return;
      }
      document.body.classList.remove('body--a11y');
      previousAction = 'mousedown';
    });

    document.addEventListener('keydown', (e) => {
      if (previousAction === 'keydown' || e.keyCode === 27) {
        return;
      }
      document.body.classList.add('body--a11y');
      previousAction = 'keydown';
    });
  } catch (error) {
    // Oh well
  }
}
export { outlineWatcher };
