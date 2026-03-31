(function () {
  const state = { order: [], openId: null };

  function byId(id) { return document.getElementById(id); }
  function lang() { return (window.MTS && window.MTS.state.lang) || 'ja'; }
  function itemName(item) { return window.MTS.itemName(item); }
  function itemDesc(item) { return window.MTS.itemDesc(item); }
  function itemTag(item) { return window.MTS.itemTag(item); }

  function t(ja, en, ko) { return lang() === 'ja' ? ja : lang() === 'ko' ? ko : en; }

  function topNoticeText() {
    return t(
      'ウォークイン優先。プレミアム丼の選択による限定優先予約をご利用いただけます。',
      'Walk-in first. Limited priority reservations are available through premium bowl selection.',
      '워킹인 우선 운영이며, 프리미엄 볼 선택을 통한 한정 우선 예약이 가능합니다.'
    );
  }

  function toMinutes(value) {
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  }

  function toTime(minutes) {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    return `${h}:${m}`;
  }

  function isBlocked(minutes, blockedRanges) {
    return blockedRanges.some(([start, end]) => minutes >= toMinutes(start) && minutes <= toMinutes(end));
  }

  function generateTimeSlots() {
    const rules = window.SITE_CONTENT.bookingRules || {};
    const start = toMinutes(rules.openingTime || '10:30');
    const end = toMinutes(rules.lastBookingTime || '20:45');
    const step = Number(rules.slotMinutes || 5);
    const blocked = rules.blockedRanges || [];
    const slots = [];
    for (let current = start; current <= end; current += step) {
      if (!isBlocked(current, blocked)) slots.push(toTime(current));
    }
    return slots;
  }

  function renderTimeSlots() {
    const select = byId('arrivalTime');
    if (!select) return;
    select.innerHTML = `<option value="">${t('選択してください', 'Select', '선택해 주세요')}</option>`;
    generateTimeSlots().forEach((slot) => {
      const option = document.createElement('option');
      option.value = slot;
      option.textContent = slot;
      select.appendChild(option);
    });
  }

  function createOrderItem(item) {
    return {
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      bowlId: item.id,
      toppings: [],
      drinkId: '',
      note: '',
      qty: 1
    };
  }

  function addToOrder(bowlId) {
    const bowl = window.SITE_CONTENT.premiumBowls.find((item) => item.id === bowlId);
    if (!bowl) return;
    const entry = createOrderItem(bowl);
    state.order.push(entry);
    state.openId = bowlId;
    renderAll();
  }

  function removeOrderItem(id) {
    state.order = state.order.filter((item) => item.id !== id);
    renderOrderSummary();
  }

  function updateOrderItem(id, patch) {
    const item = state.order.find((entry) => entry.id === id);
    if (!item) return;
    Object.assign(item, patch);
    renderOrderSummary();
  }

  function orderCountForBowl(bowlId) {
    return state.order.filter(item => item.bowlId === bowlId).length;
  }

  function toppingCheckboxes(selected) {
    return window.SITE_CONTENT.toppings.map(item => `
      <label class="checkbox-item">
        <input type="checkbox" value="${item.id}" ${selected.includes(item.id) ? 'checked' : ''}>
        <span>${itemName(item)} — ${item.price}</span>
      </label>
    `).join('');
  }

  function renderSelection() {
    const host = byId('premiumSelection');
    if (!host) return;
    host.innerHTML = window.SITE_CONTENT.premiumBowls.map(item => {
      const selected = state.order.find(entry => entry.bowlId === item.id) || { toppings: [], drinkId: '', note: '' };
      const expanded = state.openId === item.id;
      return `
        <article class="card menu-card">
          <div class="tag">${itemTag(item)}</div>
          <img src="${item.image}" alt="${itemName(item)}" style="width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:14px; margin-bottom:14px;">
          <h3>${itemName(item)}</h3>
          <p>${itemDesc(item)}</p>
          <div class="price-row">
            <strong>${item.price}</strong>
            <button type="button" class="btn ${expanded ? '' : 'btn-primary'}" data-toggle-bowl="${item.id}">${expanded ? t('閉じる', 'Close', '닫기') : t('選ぶ', 'Select', '선택')}</button>
          </div>
          ${expanded ? `
            <div class="selection-mini">
              <label>
                <span>${t('トッピング', 'Toppings', '토핑')}</span>
                <div class="selection-list two-col" data-bowl-toppings="${item.id}">${toppingCheckboxes(selected.toppings)}</div>
              </label>
              <label>
                <span>${t('ドリンク', 'Drink', '음료')}</span>
                <select data-bowl-drink="${item.id}">
                  <option value="">${t('なし', 'None', '없음')}</option>
                  ${window.SITE_CONTENT.drinks.map(drink => `<option value="${drink.id}" ${selected.drinkId === drink.id ? 'selected' : ''}>${itemName(drink)} — ${drink.price}</option>`).join('')}
                </select>
              </label>
              <label>
                <span>${t('メモ', 'Note', '메모')}</span>
                <input type="text" data-bowl-note="${item.id}" value="${selected.note || ''}" placeholder="${t('例：わさび抜き', 'e.g. no wasabi', '예: 와사비 제외')}">
              </label>
              <button type="button" class="btn btn-primary btn-add" data-add-bowl="${item.id}">${t('Add to Order', 'Add to Order', '주문에 추가')}</button>
            </div>
          ` : ''}
        </article>
      `;
    }).join('');

    host.querySelectorAll('[data-toggle-bowl]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.openId = state.openId === btn.dataset.toggleBowl ? null : btn.dataset.toggleBowl;
        renderSelection();
      });
    });

    host.querySelectorAll('[data-add-bowl]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bowlId = btn.dataset.addBowl;
        const toppings = Array.from(host.querySelectorAll(`[data-bowl-toppings="${bowlId}"] input:checked`)).map(el => el.value);
        const drinkId = host.querySelector(`[data-bowl-drink="${bowlId}"]`)?.value || '';
        const note = host.querySelector(`[data-bowl-note="${bowlId}"]`)?.value || '';
        const entry = createOrderItem(window.SITE_CONTENT.premiumBowls.find(item => item.id === bowlId));
        entry.toppings = toppings;
        entry.drinkId = drinkId;
        entry.note = note;
        state.order.push(entry);
        renderAll();
      });
    });
  }

  function renderOrderSummary() {
    const host = byId('orderSummary');
    if (!host) return;
    if (!state.order.length) {
      host.innerHTML = `<div class="selection-item">${t('まだ選択されていません', 'Nothing selected yet', '아직 선택된 항목이 없습니다')}</div>`;
      return;
    }
    host.innerHTML = state.order.map((entry, index) => {
      const bowl = window.SITE_CONTENT.premiumBowls.find(item => item.id === entry.bowlId);
      const toppings = entry.toppings.map(id => itemName(window.SITE_CONTENT.toppings.find(item => item.id === id))).join(', ') || t('なし', 'None', '없음');
      const drink = entry.drinkId ? itemName(window.SITE_CONTENT.drinks.find(item => item.id === entry.drinkId)) : t('なし', 'None', '없음');
      return `
        <div class="selection-item">
          <div class="price-row">
            <strong>${itemName(bowl)}</strong>
            <button type="button" class="btn" data-remove-order="${entry.id}">${t('削除', 'Remove', '삭제')}</button>
          </div>
          <div class="price-row">
            <span>${t('数量', 'Quantity', '수량')}: ${entry.qty}</span>
            <div class="lang-group">
              <button type="button" class="lang-btn" data-qty-down="${entry.id}">-</button>
              <button type="button" class="lang-btn" data-qty-up="${entry.id}">+</button>
            </div>
          </div>
          <div>${t('トッピング', 'Toppings', '토핑')}: ${toppings}</div>
          <div>${t('ドリンク', 'Drink', '음료')}: ${drink}</div>
          ${entry.note ? `<div>${t('メモ', 'Note', '메모')}: ${entry.note}</div>` : ''}
        </div>
      `;
    }).join('');
    host.querySelectorAll('[data-remove-order]').forEach(btn => {
      btn.addEventListener('click', () => removeOrderItem(btn.dataset.removeOrder));
    });
    host.querySelectorAll('[data-qty-up]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = state.order.find(entry => entry.id === btn.dataset.qtyUp);
        if (item) updateOrderItem(item.id, { qty: item.qty + 1 });
      });
    });
    host.querySelectorAll('[data-qty-down]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = state.order.find(entry => entry.id === btn.dataset.qtyDown);
        if (item && item.qty > 1) updateOrderItem(item.id, { qty: item.qty - 1 });
      });
    });
  }

  function buildPayload(form) {
    return {
      reservationDate: form.reservationDate.value,
      arrivalTime: form.arrivalTime.value,
      fullName: form.fullName.value,
      email: form.email.value,
      phone: form.phone.value,
      notes: form.notes.value,
      languageDetected: lang(),
      order: state.order.map(entry => ({
        bowlId: entry.bowlId,
        bowlName: itemName(window.SITE_CONTENT.premiumBowls.find(item => item.id === entry.bowlId)),
        toppings: entry.toppings.map(id => itemName(window.SITE_CONTENT.toppings.find(item => item.id === id))),
        drink: entry.drinkId ? itemName(window.SITE_CONTENT.drinks.find(item => item.id === entry.drinkId)) : '',
        quantity: entry.qty,
        note: entry.note
      }))
    };
  }

  function renderStaticText() {
    const top = byId('topNotice');
    const pending = byId('pendingNotice');
    if (top) top.textContent = topNoticeText();
    if (pending) pending.textContent = window.MTS.textFor(window.SITE_CONTENT.reservation, 'pendingNotice');
  }

  function attachForm() {
    const form = byId('reservationForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!state.order.length) {
        alert(t('先にプレミアム丼を追加してください。', 'Please add at least one premium bowl first.', '먼저 프리미엄 볼을 추가해 주세요.'));
        return;
      }
      const payload = buildPayload(form);
      sessionStorage.setItem('mtsReservationDraft', JSON.stringify(payload));

      let hidden = form.querySelector('input[name="orderJson"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'orderJson';
        form.appendChild(hidden);
      }
      hidden.value = JSON.stringify(payload.order);

      let langField = form.querySelector('input[name="languageDetected"]');
      if (!langField) {
        langField = document.createElement('input');
        langField.type = 'hidden';
        langField.name = 'languageDetected';
        form.appendChild(langField);
      }
      langField.value = payload.languageDetected;

      form.submit();
    });
  }

  function renderAll() {
    renderStaticText();
    renderTimeSlots();
    renderSelection();
    renderOrderSummary();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    attachForm();
  });
  document.addEventListener('mts:language-change', renderAll);
})();
