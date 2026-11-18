/* Touch-friendly drag & drop built on Pointer Events.
   (The browser's built-in HTML drag & drop is unreliable with fingers on iPad.)

   - token(el, data): a source. Tokens are reusable — dragging leaves the original in place.
   - zone(el, accept): a target. accept(data) returns true if the drop is correct;
     the zone itself is responsible for rendering the placed item and adding .filled.
   - Tap a token to select it, then tap a zone: same as dragging (easier for some students). */
GW.drag = (function () {
  let selected = null;

  function clearSel() {
    if (selected) selected.el.classList.remove('selected');
    selected = null;
    document.body.classList.remove('has-selection');
  }

  function zoneAt(x, y) {
    const n = document.elementFromPoint(x, y);
    return n ? n.closest('.dropzone:not(.filled)') : null;
  }

  function tryDrop(z, data) {
    const ok = !!z._accept(data);
    z.classList.remove('shake');
    if (!ok) {
      void z.offsetWidth; // restart animation
      z.classList.add('shake');
      clearTimeout(z._shakeT);
      z._shakeT = setTimeout(() => z.classList.remove('shake'), 450);
    }
    return ok;
  }

  function token(el, data) {
    el.classList.add('draggable');
    el.addEventListener('pointerdown', (e) => onDown(e, el, data));
  }

  function zone(el, accept) {
    el.classList.add('dropzone');
    el._accept = accept;
    el.addEventListener('click', () => {
      if (!selected || el.classList.contains('filled')) return;
      tryDrop(el, selected.data);
    });
  }

  function onDown(e, el, data) {
    if (e.button !== undefined && e.button > 0) return;
    if (el.classList.contains('disabled')) return;
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    const rect = el.getBoundingClientRect();
    const offX = sx - rect.left;
    const offY = sy - rect.top;
    let ghost = null;
    let over = null;
    let moved = false;
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }

    function move(ev) {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
        moved = true;
        clearSel();
        ghost = el.cloneNode(true);
        ghost.classList.add('ghost');
        ghost.classList.remove('selected', 'draggable');
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        document.body.appendChild(ghost);
        el.classList.add('drag-src');
      }
      if (!moved) return;
      ghost.style.transform = `translate(${ev.clientX - offX}px, ${ev.clientY - offY}px) scale(1.12)`;
      const z = zoneAt(ev.clientX, ev.clientY);
      if (z !== over) {
        if (over) over.classList.remove('hover');
        over = z;
        if (over) over.classList.add('hover');
      }
    }

    function up(ev) {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.classList.remove('drag-src');

      if (!moved) {
        if (ev.type === 'pointercancel') return;
        // tap = select / deselect
        if (selected && selected.el === el) { clearSel(); return; }
        clearSel();
        selected = { el, data };
        el.classList.add('selected');
        document.body.classList.add('has-selection');
        GW.sound.play('click');
        return;
      }

      if (over) over.classList.remove('hover');
      if (over && tryDrop(over, data)) { ghost.remove(); return; }
      // fly back to where it came from
      ghost.style.transition = 'transform .25s ease, opacity .25s';
      ghost.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(1)`;
      ghost.style.opacity = '0.4';
      ghost.addEventListener('transitionend', () => ghost.remove(), { once: true });
      setTimeout(() => ghost.remove(), 400);
    }

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  return { token, zone, reset: clearSel };
})();
