/* ==========================================================================
   Campus Lost and Found Platform - Administrator Script (admin.js)
   Course: CSC 3215 Web Technologies
   Used by: admin_dashboard.html, admin_users.html, admin_taxonomy.html

   Notes
   - Pure vanilla JavaScript, no libraries.
   - Everything is client-side (demo). When the PHP/DB back end is ready,
     remove the e.preventDefault() calls in the form handlers so the forms
     really POST to the server.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function nowStamp() {
    return new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  var ADMIN_NAME = 'Dr. Rahman (Admin)';
  var AUDIT_KEY = 'laf_admin_audit';

  /* ------------------------------------------------------------------
     Toast notifications
     ------------------------------------------------------------------ */
  var toastBox = null;
  function toast(message, type) {
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.className = 'toast-container';
      document.body.appendChild(toastBox);
    }
    var t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'success');
    t.setAttribute('role', 'status');
    t.textContent = message;
    toastBox.appendChild(t);
    setTimeout(function () { t.classList.add('toast-hide'); }, 2800);
    setTimeout(function () { if (t.parentNode) { t.parentNode.removeChild(t); } }, 3200);
  }

  /* ------------------------------------------------------------------
     Modal dialogs (confirm + text prompt)
     ------------------------------------------------------------------ */
  function openModal(opts) {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';

      var box = document.createElement('div');
      box.className = 'modal-box';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');

      var html = '<h3>' + esc(opts.title) + '</h3><p>' + esc(opts.message || '') + '</p>';
      if (opts.input) {
        html += '<input type="text" class="modal-input" value="' + esc(opts.value || '') + '">' +
                '<small class="modal-error"></small>';
      }
      html += '<div class="modal-actions">' +
              '<button type="button" class="btn-secondary" data-role="cancel">Cancel</button>' +
              '<button type="button" class="btn-primary" data-role="ok">' + esc(opts.okLabel || 'OK') + '</button>' +
              '</div>';
      box.innerHTML = html;
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      var input = $('.modal-input', box);
      var errBox = $('.modal-error', box);
      var okBtn = $('[data-role="ok"]', box);
      if (opts.danger) { okBtn.classList.add('btn-danger'); }
      (input || okBtn).focus();
      if (input) { input.select(); }

      function close(result) {
        document.removeEventListener('keydown', onKey);
        document.body.removeChild(overlay);
        resolve(result);
      }
      function submit() {
        if (input) {
          var v = input.value.trim();
          var msg = opts.validate ? opts.validate(v) : '';
          if (msg) { errBox.textContent = msg; return; }
          close(v);
        } else {
          close(true);
        }
      }
      function onKey(e) {
        if (e.key === 'Escape') { close(input ? null : false); }
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      }
      document.addEventListener('keydown', onKey);
      okBtn.addEventListener('click', submit);
      $('[data-role="cancel"]', box).addEventListener('click', function () { close(input ? null : false); });
      overlay.addEventListener('click', function (e) { if (e.target === overlay) { close(input ? null : false); } });
    });
  }

  function confirmDialog(title, message, okLabel, danger) {
    return openModal({ title: title, message: message, okLabel: okLabel || 'Confirm', danger: danger });
  }

  function promptDialog(title, message, value, validate) {
    return openModal({ title: title, message: message, input: true, value: value, okLabel: 'Save', validate: validate });
  }

  /* ------------------------------------------------------------------
     Inline form validation helpers
     ------------------------------------------------------------------ */
  function setError(input, message) {
    clearError(input);
    input.classList.add('input-error');
    var s = document.createElement('small');
    s.className = 'field-error';
    s.textContent = message;
    input.parentNode.appendChild(s);
  }

  function clearError(input) {
    input.classList.remove('input-error');
    var old = $('.field-error', input.parentNode);
    if (old) { old.parentNode.removeChild(old); }
  }

  function watchClear(form) {
    $$('input, select', form).forEach(function (el) {
      el.addEventListener('input', function () { clearError(el); });
      el.addEventListener('change', function () { clearError(el); });
    });
  }

  /* ------------------------------------------------------------------
     Audit trail (shared via localStorage so entries made on the users /
     taxonomy pages show up on the dashboard)
     ------------------------------------------------------------------ */
  function loadAudit() {
    try {
      return JSON.parse(localStorage.getItem(AUDIT_KEY)) || [];
    } catch (e) { return []; }
  }

  function logAudit(category, details) {
    var entry = { time: nowStamp(), admin: ADMIN_NAME, category: category, details: details };
    var list = loadAudit();
    list.unshift(entry);
    try { localStorage.setItem(AUDIT_KEY, JSON.stringify(list.slice(0, 25))); } catch (e) { /* storage blocked: ignore */ }
    var table = $('#audit-table tbody');
    if (table) { table.insertBefore(auditRow(entry), table.firstChild); }
  }

  function auditRow(e) {
    var tr = document.createElement('tr');
    tr.className = 'row-new';
    tr.innerHTML = '<td>' + esc(e.time) + '</td><td>' + esc(e.admin) + '</td><td>' +
                   esc(e.category) + '</td><td>' + esc(e.details) + '</td>';
    return tr;
  }

  /* ------------------------------------------------------------------
     Table search / filter  (+ "no results" row)
     ------------------------------------------------------------------ */
  function applyFilter(query) {
    var q = query.trim().toLowerCase();
    $$('.admin-table').forEach(function (table) {
      var body = $('tbody', table);
      var cols = table.tHead ? table.tHead.rows[0].cells.length : 1;
      var visible = 0;
      $$('tr', body).forEach(function (tr) {
        if (tr.classList.contains('no-results')) { return; }
        var match = tr.textContent.toLowerCase().indexOf(q) !== -1;
        tr.style.display = match ? '' : 'none';
        if (match) { visible++; }
      });
      var empty = $('.no-results', body);
      if (visible === 0) {
        if (!empty) {
          empty = document.createElement('tr');
          empty.className = 'no-results';
          empty.innerHTML = '<td colspan="' + cols + '">No matching records found.</td>';
          body.appendChild(empty);
        }
      } else if (empty) {
        body.removeChild(empty);
      }
    });
  }

  function initSearch() {
    var form = $('header form');
    var input = $('#admin-search');
    if (!form || !input) { return; }

    var current = location.pathname.split('/').pop() || '';
    var target = (form.getAttribute('action') || '').split('/').pop();
    var liveHere = target === current;   // only filter live if search stays on this page

    var q = new URLSearchParams(location.search).get('q');
    if (q) {
      input.value = q;
      if (liveHere || $('#user-table')) { applyFilter(q); }
    }

    if (liveHere) {
      input.addEventListener('input', function () { applyFilter(input.value); });
      form.addEventListener('submit', function (e) { e.preventDefault(); applyFilter(input.value); });
    }
  }

  /* ------------------------------------------------------------------
     Logout confirmation (header + sidebar links)
     ------------------------------------------------------------------ */
  function initLogout() {
    $$('a[href="login.html"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        confirmDialog('Sign out', 'Are you sure you want to sign out of the admin panel?', 'Sign Out')
          .then(function (ok) { if (ok) { window.location.href = 'login.html'; } });
      });
    });
  }

  /* ------------------------------------------------------------------
     Placeholder links (href="#") should not jump to top of page
     ------------------------------------------------------------------ */
  function initPlaceholderLinks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href="#"]') : null;
      if (a) { e.preventDefault(); }
    });
  }

  /* ==================================================================
     PAGE: Admin Dashboard
     ================================================================== */
  var SNAPSHOTS = {
    'October-2026':   { label: 'October 2026',   lost: 58, found: 49, claims: 41, recovered: 36, rate: 84.5 },
    'September-2026': { label: 'September 2026', lost: 64, found: 52, claims: 44, recovered: 36, rate: 80.3 },
    'August-2026':    { label: 'August 2026',    lost: 47, found: 39, claims: 30, recovered: 25, rate: 77.9 }
  };

  function animateCounters() {
    $$('.metric-value').forEach(function (el) {
      var raw = el.textContent.trim();
      var m = raw.match(/[\d,]+(\.\d+)?/);
      if (!m) { return; }
      var target = parseFloat(m[0].replace(/,/g, ''));
      var decimals = m[1] ? m[1].length - 1 : 0;
      var useComma = m[0].indexOf(',') !== -1;
      var prefix = raw.slice(0, m.index);
      var suffix = raw.slice(m.index + m[0].length);
      var start = null, duration = 900;

      function fmt(v) {
        var s = v.toFixed(decimals);
        if (useComma) { s = Number(s).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); }
        return prefix + s + suffix;
      }
      function step(ts) {
        if (start === null) { start = ts; }
        var p = Math.min((ts - start) / duration, 1);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) { requestAnimationFrame(step); } else { el.textContent = raw; }
      }
      requestAnimationFrame(step);
    });
  }

  function renderStoredAudit() {
    var body = $('#audit-table tbody');
    if (!body) { return; }
    var stored = loadAudit();
    for (var i = stored.length - 1; i >= 0; i--) {
      var tr = auditRow(stored[i]);
      tr.classList.remove('row-new');
      body.insertBefore(tr, body.firstChild);
    }
  }

  function snapshotCsv(s) {
    var rows = [
      ['Metric', 'Value'],
      ['Audit Period', s.label],
      ['Lost Reports Filed', s.lost],
      ['Found Items Reported', s.found],
      ['Claims Submitted', s.claims],
      ['Items Recovered', s.recovered],
      ['Resolution Rate (%)', s.rate]
    ];
    return rows.map(function (r) { return r.join(','); }).join('\n');
  }

  function initDashboard() {
    var form = $('#audit-form');
    if (!form) { return; }

    animateCounters();
    renderStoredAudit();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var key = $('#audit_month').value;
      var s = SNAPSHOTS[key];
      if (!s) { toast('Please select a valid audit period.', 'error'); return; }

      var card = form.parentNode;
      var old = $('.snapshot-result', card);
      if (old) { card.removeChild(old); }

      var box = document.createElement('div');
      box.className = 'snapshot-result';
      box.innerHTML =
        '<h4>Audit Snapshot: ' + esc(s.label) + '</h4>' +
        '<p class="snapshot-meta">Generated ' + esc(nowStamp()) + ' by ' + esc(ADMIN_NAME) + ' (sample data)</p>' +
        '<ul class="snapshot-list">' +
          '<li><span>Lost Reports Filed</span><strong>' + s.lost + '</strong></li>' +
          '<li><span>Found Items Reported</span><strong>' + s.found + '</strong></li>' +
          '<li><span>Claims Submitted</span><strong>' + s.claims + '</strong></li>' +
          '<li><span>Items Recovered</span><strong>' + s.recovered + '</strong></li>' +
          '<li><span>Resolution Rate</span><strong>' + s.rate + '%</strong></li>' +
        '</ul>' +
        '<button type="button" class="btn-secondary" id="snapshot-download">Download CSV</button>';
      card.appendChild(box);

      $('#snapshot-download', box).addEventListener('click', function () {
        var blob = new Blob([snapshotCsv(s)], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'audit-snapshot-' + key + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      logAudit('Audit Report', 'Generated audit snapshot for ' + s.label);
      toast('Audit snapshot generated for ' + s.label + '.');
    });
  }

  /* ==================================================================
     PAGE: User Moderation
     ================================================================== */
  var ROLE_CLASS = {
    'Student': 'badge-student',
    'Faculty/Staff': 'badge-staff',
    'Security Officer': 'badge-security',
    'Admin': 'badge-admin'
  };

  function newUserId(role) {
    var n = Math.floor(100 + Math.random() * 900);
    if (role === 'Student') { return '22-' + Math.floor(10000 + Math.random() * 90000) + '-3'; }
    if (role === 'Faculty/Staff') { return 'STF-' + n; }
    if (role === 'Security Officer') { return 'SEC-' + n; }
    return 'ADM-' + n;
  }

  function userRow(u) {
    var tr = document.createElement('tr');
    tr.className = 'row-new';
    var active = u.status === 'Active';
    tr.innerHTML =
      '<td><strong>ID: ' + esc(u.id) + '</strong><br>' + esc(u.name) + '</td>' +
      '<td>' + esc(u.email) + '</td>' +
      '<td><span class="badge ' + (ROLE_CLASS[u.role] || '') + '">' + esc(u.role) + '</span></td>' +
      '<td><span class="badge ' + (active ? 'badge-active' : 'badge-deactivated') + '">' + esc(u.status) + '</span></td>' +
      '<td>' +
        '<a href="#" class="btn-action btn-edit" data-action="toggle-status">' + (active ? 'Edit Status' : 'Activate') + '</a>' +
        '<a href="#" class="btn-action btn-delete" data-action="purge">Purge</a>' +
      '</td>';
    return tr;
  }

  function rowUserName(tr) {
    var cell = tr.cells[0];
    return cell.lastChild ? cell.lastChild.textContent.trim() : '';
  }

  function initUsers() {
    var table = $('#user-table');
    var form = $('#user-form');
    if (!table || !form) { return; }
    var body = $('tbody', table);
    watchClear(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameEl = $('#new_name'), emailEl = $('#new_email'), roleEl = $('#new_role'), statusEl = $('#initial_status');
      var name = nameEl.value.trim().replace(/\s+/g, ' ');
      var email = emailEl.value.trim().toLowerCase();
      var ok = true;

      if (!/^[A-Za-z][A-Za-z.\- ]{2,}$/.test(name)) {
        setError(nameEl, 'Enter a valid full name (letters only, at least 3 characters).'); ok = false;
      }
      if (!/^[^\s@]+@([a-z0-9-]+\.)?aiub\.edu$/.test(email)) {
        setError(emailEl, 'Use an AIUB email (…@aiub.edu or …@student.aiub.edu).'); ok = false;
      } else {
        var dup = $$('tbody tr', table).some(function (tr) {
          return tr.cells[1] && tr.cells[1].textContent.trim().toLowerCase() === email;
        });
        if (dup) { setError(emailEl, 'An account with this email already exists.'); ok = false; }
      }
      if (!roleEl.value) { setError(roleEl, 'Please select a role.'); ok = false; }
      if (!ok) { return; }

      var empty = $('.no-results', body);
      if (empty) { body.removeChild(empty); }

      var user = { id: newUserId(roleEl.value), name: name, email: email, role: roleEl.value, status: statusEl.value };
      body.insertBefore(userRow(user), body.firstChild);
      logAudit('User Provisioning', 'Created ' + user.role + ' account for ' + user.name + ' (ID: ' + user.id + ')');
      toast('Account created for ' + user.name + '.');
      form.reset();
    });

    body.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('[data-action]') : null;
      if (!link) { return; }
      e.preventDefault();
      var tr = link.closest('tr');
      var name = rowUserName(tr);
      var id = $('strong', tr.cells[0]).textContent.replace('ID:', '').trim();
      var badge = $('.badge', tr.cells[3]);

      if (link.getAttribute('data-action') === 'toggle-status') {
        var isActive = badge.classList.contains('badge-active');
        if (isActive) {
          confirmDialog('Deactivate account', 'Deactivate ' + name + '? They will no longer be able to sign in.', 'Deactivate', true)
            .then(function (ok) {
              if (!ok) { return; }
              badge.className = 'badge badge-deactivated';
              badge.textContent = 'Deactivated';
              link.textContent = 'Activate';
              logAudit('User Moderation', 'Deactivated account ' + id + ' (' + name + ')');
              toast(name + ' deactivated.', 'warn');
            });
        } else {
          badge.className = 'badge badge-active';
          badge.textContent = 'Active';
          link.textContent = 'Edit Status';
          logAudit('User Moderation', 'Re-activated account ' + id + ' (' + name + ')');
          toast(name + ' activated.');
        }
      }

      if (link.getAttribute('data-action') === 'purge') {
        confirmDialog('Purge account', 'Permanently purge ' + name + ' (' + id + ')? This cannot be undone.', 'Purge', true)
          .then(function (ok) {
            if (!ok) { return; }
            body.removeChild(tr);
            logAudit('User Moderation', 'Purged account ' + id + ' (' + name + ')');
            toast(name + ' purged.', 'warn');
          });
      }
    });
  }

  /* ==================================================================
     PAGE: Taxonomy & Configuration
     ================================================================== */
  function taxRow(name, kind) {
    var tr = document.createElement('tr');
    tr.className = 'row-new';
    var second = kind === 'Building'
      ? '<a href="#" class="btn-action btn-delete" data-action="decommission">Decommission</a>'
      : '<a href="#" class="btn-action btn-delete" data-action="delete">Delete</a>';
    tr.innerHTML =
      '<td>' + esc(name) + '</td>' +
      '<td><span class="badge badge-active">Active</span></td>' +
      '<td><a href="#" class="btn-action btn-edit" data-action="rename">Rename</a>' + second + '</td>';
    return tr;
  }

  function nameExists(tables, name, ignoreRow) {
    var lower = name.toLowerCase();
    return tables.some(function (t) {
      return $$('tbody tr', t).some(function (tr) {
        return tr !== ignoreRow && tr.cells[0] && tr.cells[0].textContent.trim().toLowerCase() === lower;
      });
    });
  }

  function initTaxonomy() {
    var locTable = $('#location-table');
    var catTable = $('#category-table');
    var form = $('#taxonomy-form');
    if (!locTable || !catTable || !form) { return; }
    watchClear(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var typeEl = $('#tax_type'), nameEl = $('#tax_name');
      var name = nameEl.value.trim().replace(/\s+/g, ' ');
      var ok = true;

      if (!typeEl.value) { setError(typeEl, 'Please choose a configuration type.'); ok = false; }
      if (name.length < 2) { setError(nameEl, 'Entry name must be at least 2 characters.'); ok = false; }
      else if (nameExists([locTable, catTable], name)) { setError(nameEl, 'This entry already exists.'); ok = false; }
      if (!ok) { return; }

      var table = typeEl.value === 'Building' ? locTable : catTable;
      var body = $('tbody', table);
      var empty = $('.no-results', body);
      if (empty) { body.removeChild(empty); }
      body.appendChild(taxRow(name, typeEl.value));
      logAudit('Taxonomy Update', 'Added new ' + (typeEl.value === 'Building' ? 'location' : 'category') + ' "' + name + '"');
      toast('"' + name + '" added.');
      form.reset();
    });

    [locTable, catTable].forEach(function (table) {
      $('tbody', table).addEventListener('click', function (e) {
        var link = e.target.closest ? e.target.closest('[data-action]') : null;
        if (!link) { return; }
        e.preventDefault();
        var tr = link.closest('tr');
        var cell = tr.cells[0];
        var oldName = cell.textContent.trim();
        var action = link.getAttribute('data-action');
        var badge = $('.badge', tr.cells[1]);

        if (action === 'rename') {
          promptDialog('Rename entry', 'Enter the new name for "' + oldName + '".', oldName, function (v) {
            if (v.length < 2) { return 'Name must be at least 2 characters.'; }
            if (nameExists([locTable, catTable], v, tr)) { return 'This name is already in use.'; }
            return '';
          }).then(function (v) {
            if (v === null || v === oldName) { return; }
            cell.textContent = v;
            logAudit('Taxonomy Update', 'Renamed "' + oldName + '" to "' + v + '"');
            toast('Renamed to "' + v + '".');
          });
        }

        if (action === 'decommission') {
          if (badge.classList.contains('badge-active')) {
            confirmDialog('Decommission location', 'Decommission "' + oldName + '"? It will no longer be offered in report forms.', 'Decommission', true)
              .then(function (ok) {
                if (!ok) { return; }
                badge.className = 'badge badge-decommissioned';
                badge.textContent = 'Decommissioned';
                link.textContent = 'Restore';
                link.classList.remove('btn-delete');
                link.classList.add('btn-edit');
                logAudit('Taxonomy Update', 'Decommissioned location "' + oldName + '"');
                toast('"' + oldName + '" decommissioned.', 'warn');
              });
          } else {
            badge.className = 'badge badge-active';
            badge.textContent = 'Active';
            link.textContent = 'Decommission';
            link.classList.remove('btn-edit');
            link.classList.add('btn-delete');
            logAudit('Taxonomy Update', 'Restored location "' + oldName + '"');
            toast('"' + oldName + '" restored.');
          }
        }

        if (action === 'delete') {
          confirmDialog('Delete category', 'Delete "' + oldName + '"? This cannot be undone.', 'Delete', true)
            .then(function (ok) {
              if (!ok) { return; }
              tr.parentNode.removeChild(tr);
              logAudit('Taxonomy Update', 'Deleted category "' + oldName + '"');
              toast('"' + oldName + '" deleted.', 'warn');
            });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initPlaceholderLinks();
    initLogout();
    initSearch();
    initDashboard();
    initUsers();
    initTaxonomy();
  });
})();
