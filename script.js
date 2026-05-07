const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxGgt3eaYxFNT7pLgyWueHkYQ0iCYoxgtXrSTauE11opVboALhV8uZE7lt8-pb-csU0/exec";

const CONFIG = {
  pins: {
    player: "1234",
    vocal: "5678"
  },

  spreadsheetId:
    "1nA6shX7I1KVkXl9LuD-aYwxRA_DL-X9E2JiLCMypVp4",

  songSheet: "DAFTAR_LAGU",

  requestSheet: "DAFTAR_REQUEST"
};

const ITEMS_PER_PAGE = 10;
const SONGS_PER_PAGE = 10;

let currentRequestPage = 1;

let allSongData = [];

let currentRole = "";

let requestSortMode = "newest";
let currentRequestKeyword = "";

let currentSongKeyword = "";
let currentSongCategory = "all";

let currentSongPages = {};

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

      loadRequestData();

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

    customSelect.classList.remove(
      "active"
    );
  }
);

if (requestSearch) {

  requestSearch.addEventListener(
    "input",
    () => {

      currentRequestKeyword =
        requestSearch.value
          .toLowerCase()
          .trim();

      currentRequestPage = 1;

      loadRequestData();

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

    if (CONFIG.pins[role] !== pin) {

      alert("PIN salah");

      return;
    }

    localStorage.setItem(
      "aqila_role",
      role
    );

    showApp(role);
  }
);

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
}

async function loadSongData(role) {

  const url =
    `https://opensheet.elk.sh/${CONFIG.spreadsheetId}/${CONFIG.songSheet}`;

  try {

    const response =
      await fetch(url);

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

    const currentPage =
      currentSongPages[category] || 1;

    const start =
      (currentPage - 1)
      * SONGS_PER_PAGE;

    const end =
      start + SONGS_PER_PAGE;

    const paginatedData =
      filteredData.slice(start, end);

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

        const value =
          item[key]?.trim()
            ? item[key]
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

    const totalPages =
      Math.ceil(
        filteredData.length /
        SONGS_PER_PAGE
      );

    if (totalPages > 1) {

      const pagination =
        document.createElement("div");

      pagination.className =
        "pagination";

      const prevBtn =
        document.createElement("button");

      prevBtn.innerHTML =
        '<i class="ri-arrow-left-s-line"></i>';

      prevBtn.disabled =
        currentPage === 1;

      prevBtn.onclick = () => {

        currentSongPages[category]--;

        applySongFilter();

        scrollToTop();
      };

      pagination.appendChild(prevBtn);

      addSongPageButton(1);

      if (currentPage > 3) {

        addSongDots();
      }

      if (
        currentPage !== 1 &&
        currentPage !== totalPages
      ) {

        addSongPageButton(
          currentPage
        );
      }

      if (
        currentPage <=
        totalPages - 2
      ) {

        addSongDots();
      }

      if (totalPages > 1) {

        addSongPageButton(
          totalPages
        );
      }

      const nextBtn =
        document.createElement("button");

      nextBtn.innerHTML =
        '<i class="ri-arrow-right-s-line"></i>';

      nextBtn.disabled =
        currentPage === totalPages;

      nextBtn.onclick = () => {

        currentSongPages[category]++;

        applySongFilter();

        scrollToTop();
      };

      pagination.appendChild(nextBtn);

      card.appendChild(pagination);

      function addSongPageButton(page) {

        const btn =
          document.createElement("button");

        btn.innerText = page;

        if (page === currentPage) {

          btn.classList.add(
            "active"
          );
        }

        btn.onclick = () => {

          currentSongPages[category] =
            page;

          applySongFilter();

          scrollToTop();
        };

        pagination.appendChild(btn);
      }

      function addSongDots() {

        const dots =
          document.createElement("span");

        dots.className =
          "pagination-dots";

        dots.innerText = "...";

        pagination.appendChild(dots);
      }
    }

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

  if (
    currentSongCategory !== "all"
  ) {

    filtered =
      filtered.filter(item =>

        item["Kategori"] ===
        currentSongCategory
      );
  }

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

  const url =
    `https://opensheet.elk.sh/${CONFIG.spreadsheetId}/${CONFIG.requestSheet}`;

  try {

    const response =
      await fetch(url);

    const data =
      await response.json();

    renderRequestTable(data);

  } catch (error) {

    console.error(error);

    requestBody.innerHTML = `
      <tr>
        <td colspan="10">
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
        <td colspan="10">
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

      const value =
        item[key]?.trim()
          ? item[key]
          : "-";

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

    loadRequestData();

    scrollToTop();
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

    loadRequestData();

    scrollToTop();
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

      loadRequestData();

      scrollToTop();
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

function scrollToTop() {

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
      1 * 30 * 1000;

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

          mode: "no-cors",

          body: JSON.stringify({
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

customSelect.addEventListener(
  "click",
  (e) => {

    e.stopPropagation();

    customSelect.classList.toggle(
      "active"
    );
  }
);

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

setInterval(() => {

  const role =
    localStorage.getItem(
      "aqila_role"
    );

  if (!role) return;

  loadSongData(role);

  const currentPageBackup =
    currentRequestPage;

  loadRequestData();

  currentRequestPage =
    currentPageBackup;

}, 5000);

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
    1 * 30 * 1000;

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