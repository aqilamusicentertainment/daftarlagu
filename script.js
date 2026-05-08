const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzHHhREDEY_fU4SLpRkbtLrbNghUYRGOTzIjvFaO8mD2gAtAWPSv-Nw4AX0Aa6VRBhg/exec";

const ITEMS_PER_PAGE = 10;

let currentRequestPage = 1;

let allSongData = [];
let allRequestData = [];

let currentRole = "";

let requestSortMode = "newest";
let currentRequestKeyword = "";

let currentSongKeyword = "";
let currentSongCategory = "all";

let notificationImages = [];

let currentNotifIndex = 0;

let notifInterval = null;

let notifResumeTimeout = null;

let isDragging = false;

let notifStartX = 0;

let notifMoveX = 0;
let notifDragged = false;
let notifModalTouched = false;

const notifTrack =
  document.getElementById(
    "notifTrack"
  );

const notifDots =
  document.getElementById(
    "notifDots"
  );

const loginPage =
  document.getElementById("loginPage");

const appPage =
  document.getElementById("appPage");

const loginForm =
  document.getElementById("loginForm");

const roleBadge =
  document.getElementById("roleBadge");

const songTables =
  document.getElementById("songTables");

const requestHead =
  document.getElementById("requestHead");

const requestBody =
  document.getElementById("requestBody");

const logoutBtn =
  document.getElementById("logoutBtn");

const requestBtn =
  document.getElementById("requestBtn");

const songSearch =
  document.getElementById("songSearch");

const requestSearch =
  document.getElementById(
    "requestSearch"
  );

const songCategoryFilter =
  document.getElementById(
    "songCategoryFilter"
  );

const songCategoryText =
  document.getElementById(
    "songCategoryText"
  );

const requestFilter =
  document.getElementById(
    "requestFilter"
  );

const filterSelectedText =
  document.getElementById(
    "filterSelectedText"
  );

const filterOptions =
  requestFilter.querySelectorAll(
    ".filter-option"
  );

requestFilter.addEventListener(
  "click",
  (e) => {

    e.stopPropagation();

    requestFilter.classList.toggle(
      "active"
    );
  }
);

if (songCategoryFilter) {

  const categoryOptions =
    songCategoryFilter.querySelectorAll(
      ".filter-option"
    );

  songCategoryFilter.addEventListener(
    "click",
    (e) => {

      e.stopPropagation();

      songCategoryFilter.classList.toggle(
        "active"
      );
    }
  );

  categoryOptions.forEach(option => {

    option.addEventListener(
      "click",
      (e) => {

        e.stopPropagation();

        categoryOptions.forEach(o =>
          o.classList.remove("active")
        );

        option.classList.add(
          "active"
        );

        currentSongCategory =
          option.dataset.value;

        songCategoryText.innerText =
          option.innerText;

        songCategoryFilter.classList.remove(
          "active"
        );

        applySongFilter();

        scrollToTop();
      }
    );
  });
}

filterOptions.forEach(option => {

  option.addEventListener(
    "click",
    (e) => {

      e.stopPropagation();

      filterOptions.forEach(o =>
        o.classList.remove("active")
      );

      option.classList.add(
        "active"
      );

      const value =
        option.dataset.value;

      requestSortMode = value;

      filterSelectedText.innerText =
        option.innerText;

      currentRequestPage = 1;

      requestFilter.classList.remove(
        "active"
      );

      renderRequestTable(allRequestData);

      scrollToTop();
    }
  );
});

document.addEventListener(
  "click",
  () => {

    requestFilter.classList.remove(
      "active"
    );

    if (songCategoryFilter) {

      songCategoryFilter.classList.remove(
        "active"
      );
    }

    if (customSelect) {

  customSelect.classList.remove(
    "active"
  );
}
  }
);

function updateNotifSlider() {

  notifTrack.style.transform =
    `translateX(-${currentNotifIndex * 100}%)`;

  document
    .querySelectorAll(".notif-dot")
    .forEach((dot, index) => {

      dot.classList.toggle(
        "active",
        index ===
        (
          currentNotifIndex %
          notificationImages.length
        )
      );
    });
}

function startNotifAutoplay() {

  clearInterval(notifInterval);

  if (
    notificationImages.length <= 1
  ) return;

  notifInterval =
    setInterval(() => {

      currentNotifIndex++;

      if (
        currentNotifIndex >=
        notificationImages.length
      ) {

        currentNotifIndex = 0;
      }

      notifTrack.style.transition =
        "transform .45s ease";

      updateNotifSlider();

    }, 5000);
}

function pauseNotifAutoplay() {

  clearInterval(notifInterval);

  clearTimeout(
    notifResumeTimeout
  );

  notifResumeTimeout =
    setTimeout(() => {

      startNotifAutoplay();

    }, 10000);
}

if (requestSearch) {

  requestSearch.addEventListener(
    "input",
    () => {

      currentRequestKeyword =
        requestSearch.value
          .toLowerCase()
          .trim();

      currentRequestPage = 1;

      renderRequestTable(allRequestData);

      scrollToTop();
    }
  );
}

let isSendingRequest = false;

loginForm.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const role =
      document.getElementById("role").value;

    const pin =
      document.getElementById("pin").value;

    if (!role || !pin) {

      alert("Lengkapi data login");

      return;
    }

    const submitBtn =
      loginForm.querySelector("button");

    submitBtn.disabled = true;

    submitBtn.innerHTML = `
      <i class="ri-loader-4-line rotating"></i>
      Memeriksa...
    `;

    try {

      const response =
        await fetch(
          SCRIPT_URL,
          {
            method: "POST",

            body: JSON.stringify({
              action: "login",
              role,
              pin
            })
          }
        );

      const result =
        await response.json();

      if (!result.success) {

        alert("PIN salah");

        submitBtn.disabled = false;

        submitBtn.innerText =
          "Masuk";

        return;
      }

      localStorage.setItem(
        "aqila_role",
        role
      );

      alert(
        "Login berhasil 🔥"
      );

      setTimeout(() => {

        showApp(role);

      }, 300);

    } catch (error) {

      console.error(error);

      alert("Gagal login");

      submitBtn.disabled = false;

      submitBtn.innerText =
        "Masuk";
    }
  }
);

async function loadNotification() {

  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {
          method: "POST",

          body: JSON.stringify({
            action: "notification"
          })
        }
      );

    const data =
      await response.json();

    notificationImages =
      data.images || [];

    notificationImages.forEach(item => {

      const preload =
        new Image();

      preload.src =
        item.image;
    });

  } catch (error) {

    console.error(
      "Notif gagal dimuat",
      error
    );
  }
}

function showApp(role) {

  currentRole = role;

  document.body.classList.remove(
    "player-mode",
    "vocal-mode"
  );

  document.body.classList.add(
    role + "-mode"
  );

  loginPage.classList.add("hidden");

  appPage.classList.remove("hidden");

  roleBadge.innerText =
    role.toUpperCase();

  loadSongData(role);

  loadRequestData();
  loadNotification();
}

async function loadSongData(role) {

if (!allSongData.length) {

  songTables.innerHTML = `
    <div class="table-card">
      <div class="loading-state">
        <i class="ri-loader-4-line rotating"></i>
        Memuat daftar lagu...
      </div>
    </div>
  `;
}

  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {
          method: "POST",

          body: JSON.stringify({
            action: "songs"
          })
        }
      );

    const data =
      await response.json();

    allSongData = data;

    applySongFilter();

  } catch (error) {

    console.error(error);

    songTables.innerHTML = `
      <div class="table-card">
        Gagal mengambil data lagu
      </div>
    `;
  }
}

function renderTable(data, role) {

  const categories = [
    "Trend 2026",
    "Trend 2025",
    "Trend 2024",
    "Trend 2023 Kebawah",
    "Lawasan V1",
    "Lawasan V2",
    "Campursari",
    "Religi"
  ];

  songTables.innerHTML = "";

  let keys = [];

  if (role === "player") {

    keys = [
      "Nama Lagu",
      "Chord Pria",
      "Chord Wanita",
      "Tempo",
      "Catatan"
    ];

  } else {

    keys = [
      "Nama Lagu",
      "Catatan"
    ];
  }

  const visibleCategories =
    currentSongCategory === "all"
      ? categories
      : [currentSongCategory];

  visibleCategories.forEach(category => {

    let filteredData =
      data.filter(item =>
        item["Kategori"] === category
      );

    const card =
      document.createElement("div");

    card.className =
      "table-card";

    const title =
      document.createElement("div");

    title.className =
      "card-title";

    title.innerHTML = `
      <div class="category-label">
        <span class="category-dot"></span>
        ${category}
      </div>
    `;

    card.appendChild(title);

    const wrapper =
      document.createElement("div");

    wrapper.className =
      "table-responsive";

    if (filteredData.length === 0) {

      wrapper.innerHTML = `
        <div class="empty-state">
          Belum ada lagu
        </div>
      `;

      card.appendChild(wrapper);

      songTables.appendChild(card);

      return;
    }

    const paginatedData =
      filteredData;

    const table =
      document.createElement("table");

    const thead =
      document.createElement("thead");

    const headRow =
      document.createElement("tr");

    keys.forEach(key => {

      const th =
        document.createElement("th");

      th.textContent = key;

      headRow.appendChild(th);
    });

    thead.appendChild(headRow);

    table.appendChild(thead);

    const tbody =
      document.createElement("tbody");

    paginatedData.forEach(item => {

      const tr =
        document.createElement("tr");

      keys.forEach(key => {

        const td =
          document.createElement("td");

        const raw =
  item[key];

const value =
  raw !== undefined &&
  raw !== null &&
  String(raw).trim() !== ""
    ? raw
    : "-";

        if (key === "Catatan") {

          td.classList.add(
            "song-note-col"
          );
        }

        if (key === "Waktu") {

          const parts =
            value.split(" ");

          td.innerHTML =
            `${parts[0]}<br>${parts[1] || ""}`;

        } else {

          td.textContent = value;
        }

        if (key === "Nama Lagu") {

          td.classList.add(
            "text-left"
          );
        }

        if (key === "Catatan") {

          td.classList.add(
            "note-cell"
          );

          if (value === "-") {

            td.classList.add(
              "note-empty"
            );
          }
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    wrapper.appendChild(table);

    card.appendChild(wrapper);

    songTables.appendChild(card);
  });
}

if (songSearch) {

  songSearch.addEventListener(
    "input",
    () => {

      currentSongKeyword =
        songSearch.value
          .toLowerCase()
          .trim();

      applySongFilter();

      scrollToTop();
    }
  );
}

function applySongFilter() {

  let filtered =
    [...allSongData];

  if (currentSongKeyword) {

    filtered =
      filtered.filter(item => {

        const lagu =
          item["Nama Lagu"] || "";

        return lagu
          .toLowerCase()
          .includes(currentSongKeyword);
      });
  }

  renderTable(
    filtered,
    currentRole
  );
}

async function loadRequestData() {

if (!requestBody.innerHTML.trim()) {

  requestBody.innerHTML = `
    <tr>

      <td colspan="4">

        <div class="loading-state">

          <i class="ri-loader-4-line rotating"></i>

          Memuat daftar request...

        </div>

      </td>

    </tr>
  `;
}

  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {
          method: "POST",

          body: JSON.stringify({
            action: "requests"
          })
        }
      );

    const data =
      await response.json();

    allRequestData = data;

    renderRequestTable(allRequestData);

  } catch (error) {

    console.error(error);

    requestBody.innerHTML = `
      <tr>
        <td colspan="4">
          Gagal memuat request
        </td>
      </tr>
    `;
  }
}

function renderRequestTable(data) {

  const keys = [
    "Waktu",
    "Nama Lagu",
    "Catatan",
    "Peminta"
  ];

  const requestTable =
    document.querySelector(
      "#requestSection .table-responsive"
    );

  if (!data || data.length === 0) {

    requestTable.classList.add(
      "table-empty"
    );

    requestHead.innerHTML = "";

    requestBody.innerHTML = `
      <tr>
        <td colspan="4">
          Belum ada request
        </td>
      </tr>
    `;

    document
      .getElementById(
        "requestPagination"
      )
      .classList.add("hidden");

    return;
  }

  requestTable.classList.remove(
    "table-empty"
  );

  requestHead.innerHTML = "";

  keys.forEach(key => {

    const th =
      document.createElement("th");

    th.textContent = key;

    requestHead.appendChild(th);
  });

  requestBody.innerHTML = "";

  if (currentRequestKeyword) {

    data = data.filter(item => {

      const lagu =
        item["Nama Lagu"] || "";

      const catatan =
        item["Catatan"] || "";

      const peminta =
        item["Peminta"] || "";

      return (
        lagu
          .toLowerCase()
          .includes(currentRequestKeyword)

        ||

        catatan
          .toLowerCase()
          .includes(currentRequestKeyword)

        ||

        peminta
          .toLowerCase()
          .includes(currentRequestKeyword)
      );
    });
  }

data = [...data];

if (requestSortMode === "newest") {

  data.reverse();
}

  const start =
    (currentRequestPage - 1)
    * ITEMS_PER_PAGE;

  const end =
    start + ITEMS_PER_PAGE;

  const paginatedData =
    data.slice(start, end);

  paginatedData.forEach(item => {

    const tr =
      document.createElement("tr");

    keys.forEach(key => {

      const td =
        document.createElement("td");

      let value =
        item[key] || "-";

      if (key === "Waktu") {

        const date =
          new Date(value);

        if (!isNaN(date)) {

          value =
            date.toLocaleString(
              "id-ID",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }
            );
        }
      }

      td.textContent = value;

      if (key === "Nama Lagu") {

        td.classList.add(
          "text-left"
        );
      }

      if (key === "Catatan") {

        td.classList.add(
          "note-cell"
        );

        if (value === "-") {

          td.classList.add(
            "note-empty"
          );
        }
      }

      if (key === "Waktu") {

        td.classList.add(
          "date-cell"
        );
      }

      tr.appendChild(td);
    });

    requestBody.appendChild(tr);
  });

  renderRequestPagination(
    data.length
  );
}

function renderRequestPagination(totalItems) {

  const pagination =
    document.getElementById(
      "requestPagination"
    );

  pagination.innerHTML = "";

  const totalPages =
    Math.ceil(
      totalItems / ITEMS_PER_PAGE
    );

  if (totalItems <= ITEMS_PER_PAGE) {

    pagination.classList.add(
      "hidden"
    );

    return;
  }

  pagination.classList.remove(
    "hidden"
  );

  const prevBtn =
    document.createElement("button");

  prevBtn.innerHTML =
    '<i class="ri-arrow-left-s-line"></i>';

  prevBtn.disabled =
    currentRequestPage === 1;

  prevBtn.onclick = () => {

    currentRequestPage--;

    renderRequestTable(allRequestData);

    scrollToTop(
  document.getElementById(
    "requestSection"
  )
);
  };

  pagination.appendChild(prevBtn);

  addPageButton(1);

  if (currentRequestPage > 3) {
    addDots();
  }

  if (
    currentRequestPage !== 1 &&
    currentRequestPage !== totalPages
  ) {

    addPageButton(
      currentRequestPage
    );
  }

  if (
    currentRequestPage <=
    totalPages - 2
  ) {

    addDots();
  }

  if (totalPages > 1) {
    addPageButton(totalPages);
  }

  const nextBtn =
    document.createElement("button");

  nextBtn.innerHTML =
    '<i class="ri-arrow-right-s-line"></i>';

  nextBtn.disabled =
    currentRequestPage === totalPages;

  nextBtn.onclick = () => {

    currentRequestPage++;

    renderRequestTable(allRequestData);

    scrollToTop(
      document.getElementById(
        "requestSection"
      )
    );
  };

  pagination.appendChild(nextBtn);

  function addPageButton(page) {

    const btn =
      document.createElement("button");

    btn.innerText = page;

    if (page === currentRequestPage) {

      btn.classList.add(
        "active"
      );
    }

    btn.onclick = () => {

      currentRequestPage = page;

      renderRequestTable(allRequestData);

      scrollToTop(
  document.getElementById(
    "requestSection"
  )
);
    };

    pagination.appendChild(btn);
  }

  function addDots() {

    const dots =
      document.createElement("span");

    dots.className =
      "pagination-dots";

    dots.innerText = "...";

    pagination.appendChild(dots);
  }
}

function scrollToTop(
  target = null
) {

  if (target) {

const y =
  target.getBoundingClientRect()
    .top +
  window.pageYOffset +
  30;

    window.scrollTo({
      top: y,
      behavior: "smooth"
    });

    return;
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

const navBtns =
  document.querySelectorAll(".nav-btn");

const sections =
  document.querySelectorAll(".content-section");

navBtns.forEach(btn => {

  btn.addEventListener(
    "click",
    () => {

      navBtns.forEach(b =>
        b.classList.remove("active")
      );

      btn.classList.add("active");

      const target =
        btn.dataset.target;

      localStorage.setItem(
        "aqila_tab",
        target
      );

      sections.forEach(section => {

        section.classList.remove(
          "active"
        );
      });

      document
        .getElementById(target)
        .classList.add("active");

      scrollToTop();
    }
  );
});

logoutBtn.addEventListener(
  "click",
  () => {

    const confirmLogout =
      confirm(
        "Yakin ingin logout?"
      );

    if (!confirmLogout) return;

    localStorage.removeItem(
      "aqila_role"
    );

    location.reload();
  }
);

window.addEventListener(
  "load",
  () => {

    const role =
      localStorage.getItem(
        "aqila_role"
      );

    if (role) {

      showApp(role);

      const savedTab =
        localStorage.getItem(
          "aqila_tab"
        );

      if (savedTab) {

        navBtns.forEach(btn => {

          btn.classList.remove(
            "active"
          );

          if (
            btn.dataset.target ===
            savedTab
          ) {

            btn.classList.add(
              "active"
            );
          }
        });

        sections.forEach(section => {

          section.classList.remove(
            "active"
          );
        });

        document
          .getElementById(savedTab)
          .classList.add("active");
      }
    }
  }
);
const requestForm =
  document.getElementById(
    "requestForm"
  );

requestForm.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    if (isSendingRequest) return;

    const lastRequest =
      localStorage.getItem(
        "aqila_last_request"
      );

    const now = Date.now();

    const cooldown =
      1 * 60 * 1000;

    if (lastRequest) {

      const diff =
        now - Number(lastRequest);

      if (diff < cooldown) {

        const remain =
          cooldown - diff;

        const minutes =
          Math.floor(
            remain / 60000
          );

        const seconds =
          Math.floor(
            (remain % 60000) / 1000
          );

        alert(
          `Tunggu ${minutes}m ${seconds}d sebelum request lagi`
        );

        return;
      }
    }

    const namaLagu =
      document.getElementById(
        "namaLagu"
      ).value.trim();

    const catatan =
      document.getElementById(
        "catatan"
      ).value.trim();

    if (!namaLagu) {

      alert(
        "Nama lagu wajib diisi"
      );

      return;
    }

    if (namaLagu.length > 30) {

      alert(
        "Nama lagu maksimal 30 karakter"
      );

      return;
    }

    if (catatan.length > 100) {

      alert(
        "Catatan maksimal 100 karakter"
      );

      return;
    }

    const confirmRequest =
      confirm(
        "Kirim request lagu ini?"
      );

    if (!confirmRequest) return;

    const role =
      localStorage.getItem(
        "aqila_role"
      );

    const roleLabel = {
      player: "Player",
      vocal: "Vocal"
    };

    try {

      isSendingRequest = true;

      requestBtn.disabled = true;

      requestBtn.innerText =
        "Mengirim...";

    await fetch(
      SCRIPT_URL,
      {
        method: "POST",

        body: JSON.stringify({
          action: "addRequest",

          namaLagu,
          catatan,

          requestBy:
            roleLabel[role]
        })
      }
    );

      localStorage.setItem(
        "aqila_last_request",
        Date.now()
      );

      updateRequestCooldown();

      alert(
        "Request berhasil dikirim 🔥"
      );

      requestForm.reset();

      namaCounter.textContent =
        "0/30";

      catatanCounter.textContent =
        "0/100";

      loadRequestData();

    } catch (error) {

      console.error(error);

      alert(
        "Gagal mengirim request"
      );

      requestBtn.disabled = false;

      requestBtn.innerText =
        "Kirim Request";
    }

    isSendingRequest = false;
  }
);

const themeToggle =
  document.getElementById(
    "themeToggle"
  );

const themeToggleApp =
  document.getElementById(
    "themeToggleApp"
  );

function toggleTheme() {

  document.body.classList.toggle(
    "dark"
  );

  const isDark =
    document.body.classList.contains(
      "dark"
    );

  localStorage.setItem(
    "aqila_theme",
    isDark ? "dark" : "light"
  );
}

if (themeToggle) {

  themeToggle.addEventListener(
    "click",
    toggleTheme
  );
}

if (themeToggleApp) {

  themeToggleApp.addEventListener(
    "click",
    toggleTheme
  );
}

window.addEventListener(
  "load",
  () => {

    const savedTheme =
      localStorage.getItem(
        "aqila_theme"
      );

    if (savedTheme === "dark") {

      document.body.classList.add(
        "dark"
      );
    }
  }
);

const customSelect =
  document.getElementById(
    "customSelect"
  );

const selectedText =
  document.getElementById(
    "selectedText"
  );

const roleInput =
  document.getElementById(
    "role"
  );

const options =
  document.querySelectorAll(
    ".select-option"
  );

if (customSelect) {

  customSelect.addEventListener(
    "click",
    (e) => {

      e.stopPropagation();

      customSelect.classList.toggle(
        "active"
      );
    }
  );
}

options.forEach(option => {

  option.addEventListener(
    "click",
    (e) => {

      e.stopPropagation();

      const value =
        option.dataset.value;

      const text =
        option.innerText;

      selectedText.innerText =
        text;

      roleInput.value =
        value;

      customSelect.classList.remove(
        "active"
      );
    }
  );
});

const namaLaguInput =
  document.getElementById(
    "namaLagu"
  );

const catatanInput =
  document.getElementById(
    "catatan"
  );

const namaCounter =
  document.getElementById(
    "namaCounter"
  );

const catatanCounter =
  document.getElementById(
    "catatanCounter"
  );

namaLaguInput.addEventListener(
  "input",
  () => {

    namaCounter.textContent =
      `${namaLaguInput.value.length}/30`;
  }
);

catatanInput.addEventListener(
  "input",
  () => {

    catatanCounter.textContent =
      `${catatanInput.value.length}/100`;
  }
);

function updateRequestCooldown() {

  if (!requestBtn) return;

  const lastRequest =
    localStorage.getItem(
      "aqila_last_request"
    );

  if (!lastRequest) {

    requestBtn.disabled = false;

    requestBtn.innerText =
      "Kirim Request";

    return;
  }

  const cooldown =
    1 * 60 * 1000;

  const now = Date.now();

  const diff =
    now - Number(lastRequest);

  if (diff >= cooldown) {

    requestBtn.disabled = false;

    requestBtn.innerText =
      "Kirim Request";

    return;
  }

  const remain =
    cooldown - diff;

  const minutes =
    Math.floor(
      remain / 60000
    );

  const seconds =
    Math.floor(
      (remain % 60000) / 1000
    );

  requestBtn.disabled = true;

  requestBtn.innerText =
    `Tunggu ${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
}

const notifModal =
  document.getElementById(
    "notifModal"
  );

const notifImage =
  document.getElementById(
    "notifImage"
  );

const notifClose =
  document.getElementById(
    "notifClose"
  );

const notifBtn =
  document.querySelector(
    ".ri-notification-3-line"
  ).parentElement;

notifBtn.addEventListener(
  "click",
  () => {

    if (!notificationImages.length) {

      alert(
        "Notifikasi belum tersedia"
      );

      return;
    }

    currentNotifIndex = 0;

    notifTrack.innerHTML = "";

    notifDots.innerHTML = "";

    notificationImages.forEach(
      (src, index) => {

        const slide =
          document.createElement("div");

        slide.className =
          "notif-slide";

        slide.innerHTML = `
          <img
            src="${src.image}"
            draggable="false"
          >
        `;

        const img =
          slide.querySelector("img");

        img.addEventListener(
          "load",
          () => {

            const canvas =
              document.createElement(
                "canvas"
              );

            const ctx =
              canvas.getContext("2d");

            canvas.width = 1;
            canvas.height = 1;

            ctx.drawImage(
              img,
              0,
              0,
              1,
              1
            );

            const pixel =
              ctx.getImageData(
                0,
                0,
                1,
                1
              ).data;

            const color =
              `rgba(
                ${pixel[0]},
                ${pixel[1]},
                ${pixel[2]},
                .45
              )`;

            slide.style.border =
              `1px solid ${color}`;
          }
        );

        if (src.link) {

          slide.style.cursor =
            "pointer";

          slide.addEventListener(
            "click",
            () => {

              if (notifDragged) return;

              window.open(
                src.link,
                "_blank"
              );
            }
          );
        }

        notifTrack.appendChild(
          slide
        );

        const dot =
          document.createElement("div");

        dot.className =
          "notif-dot";

        if (index === 0) {

          dot.classList.add(
            "active"
          );
        }

        dot.addEventListener(
          "click",
          () => {

            currentNotifIndex = index;

            notifTrack.style.transition =
              "transform .45s ease";

            updateNotifSlider();

            pauseNotifAutoplay();
          }
        );

        notifDots.appendChild(dot);
      }
    );

    updateNotifSlider();

    notifModal.classList.remove(
      "hidden"
    );

    clearInterval(notifInterval);

    if (
      notificationImages.length > 1
    ) {

      startNotifAutoplay();
    }
  }
);

notifClose.addEventListener(
  "click",
  () => {

    notifModal.classList.add(
      "hidden"
    );

    clearInterval(
      notifInterval
    );
  }
);

notifModal.addEventListener(
  "click",
  (e) => {

    if (
      !e.target.closest(
        ".notif-box"
      )
    ) {

      notifModal.classList.add(
        "hidden"
      );

      clearInterval(
        notifInterval
      );
    }
  }
);

notifModal.addEventListener(
  "pointerup",
  (e) => {

    if (
      e.target === notifModal &&
      notifModalTouched &&
      !notifDragged
    ) {

      notifModal.classList.add(
        "hidden"
      );

      clearInterval(
        notifInterval
      );
    }

    notifModalTouched = false;
  }
);

function notifPointerStart(x) {

  isDragging = true;

  notifDragged = false;

  notifStartX = x;

  notifMoveX = x;

  pauseNotifAutoplay();
}

function notifPointerMove(x) {

  if (!isDragging) return;

  notifMoveX = x;

  if (
    Math.abs(
      notifStartX - notifMoveX
    ) > 10
  ) {

    notifDragged = true;
  }
}

function notifPointerEnd() {

  if (!isDragging) return;

  isDragging = false;

  const diff =
    notifStartX - notifMoveX;

  if (Math.abs(diff) < 50) {

    isDragging = false;

    return;
  }

  if (diff > 0) {

    currentNotifIndex++;

  if (
    currentNotifIndex >=
    notificationImages.length
  ) {

    currentNotifIndex = 0;
  }

  } else {

    currentNotifIndex--;

    if (currentNotifIndex < 0) {

      currentNotifIndex = 0;
    }
  }

  notifTrack.style.transition =
    "transform .45s ease";

  updateNotifSlider();

  setTimeout(() => {

    notifDragged = false;

  }, 100);
}

notifTrack.addEventListener(
  "touchstart",
  (e) => {

    notifPointerStart(
      e.touches[0].clientX
    );
  }
);

notifTrack.addEventListener(
  "touchmove",
  (e) => {

    notifPointerMove(
      e.touches[0].clientX
    );
  }
);

notifTrack.addEventListener(
  "touchend",
  notifPointerEnd
);

notifTrack.addEventListener(
  "mousedown",
  (e) => {

    e.preventDefault();

    notifPointerStart(
      e.clientX
    );
  }
);

notifTrack.addEventListener(
  "mousemove",
  (e) => {

    if (!isDragging) return;

    e.preventDefault();

    notifPointerMove(
      e.clientX
    );
  }
);

notifTrack.addEventListener(
  "mouseup",
  notifPointerEnd
);

notifTrack.addEventListener(
  "mouseleave",
  () => {

    if (isDragging) {

      notifPointerEnd();
    }
  }
);

setInterval(
  updateRequestCooldown,
  1000
);

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => {

        console.log("PWA aktif");
      });
  });
}

updateRequestCooldown();