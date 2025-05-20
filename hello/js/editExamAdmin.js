document.addEventListener("DOMContentLoaded", function () {
  // Tạo HTML cho modal và thêm vào body
  const modalHTML =
    '<div class="modal-exam" id="examModal">' +
    '<div class="modal-exam-content">' +
    '<h3 id="modalTitle">Thêm bài thi mới</h3>' +
    '<form id="examForm" class="modal-exam-form">' +
    '<div class="form-group">' +
    '<label for="examTitle">Tên đề thi:</label>' +
    '<input type="text" id="examTitle" placeholder="Tên đề thi" required>' +
    "</div>" +
    '<div class="form-group">' +
    '<label for="examDuration">Thời Gian làm bài:</label>' +
    '<input type="number" id="examDuration" placeholder="Thời gian" required>' +
    "</div>" +
    '<div class="form-group">' +
    '<label for="questionSearch">Tìm kiếm câu hỏi ca sáng:</label>' +
    '<input type="text" id="questionSearch" placeholder="Nhập ID hoặc nội dung câu hỏi">' +
    '<div id="searchResults" class="search-results"></div>' +
    '<div class="search-actions">' +
    '<button type="button" class="btn-select-all">Chọn tất cả</button>' +
    '<button type="button" class="btn-deselect-all">Bỏ chọn tất cả</button>' +
    "</div>" +
    "</div>" +
    '<div class="form-group">' +
    '<label>Câu hỏi ca sáng đã chọn: <span id="selectedCount">0</span> câu</label>' +
    '<div id="selectedQuestions" class="selected-questions"></div>' +
    "</div>" +
    '<div class="form-group">' +
    '<label for="questionSearch2">Tìm kiếm câu hỏi ca chiều:</label>' +
    '<input type="text" id="questionSearch2" placeholder="Nhập ID hoặc nội dung câu hỏi">' +
    '<div id="searchResults2" class="search-results"></div>' +
    '<div class="search-actions">' +
    '<button type="button" class="btn-select-all2">Chọn tất cả</button>' +
    '<button type="button" class="btn-deselect-all2">Bỏ chọn tất cả</button>' +
    "</div>" +
    "</div>" +
    '<div class="form-group">' +
    '<label>Câu hỏi ca chiều đã chọn: <span id="selectedCount2">0</span> câu</label>' +
    '<div id="selectedQuestions2" class="selected-questions"></div>' +
    "</div>" +
    '<div class="modal-exam-actions">' +
    '<button type="submit" class="btn-save-exam">Lưu</button>' +
    '<button type="button" class="btn-close-exam">Đóng</button>' +
    "</div>" +
    "</form>" +
    "</div>" +
    "</div>";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = modalHTML;
  document.body.appendChild(tempDiv.firstChild);

  // Lấy các phần tử DOM và kiểm tra sự tồn tại
  const modal = document.getElementById("examModal");
  if (!modal) return;

  const modalTitle = document.getElementById("modalTitle");
  const examForm = document.getElementById("examForm");
  const examTitle = document.getElementById("examTitle");
  const examDuration = document.getElementById("examDuration");
  const closeBtn = modal.getElementsByClassName("btn-close-exam")[0];
  const questionSearch = document.getElementById("questionSearch");
  const searchResults = document.getElementById("searchResults");
  const selectedQuestions = document.getElementById("selectedQuestions");
  const selectedCount = document.getElementById("selectedCount");
  const examSearch = document.getElementById("searchExam");
  const contentList = document.getElementById("examTableBody");
  const firstPageBtn = document.getElementById("Exam-Question-firstPage");
  const prevPageBtn = document.getElementById("Exam-Question-prevPage");
  const nextPageBtn = document.getElementById("Exam-Question-nextPage");
  const lastPageBtn = document.getElementById("Exam-Question-lastPage");
  const pageNumbersContainer = document.getElementById(
    "Exam-Question-pageNumbers"
  );

  // Biến trạng thái
  let currentExamId = null; // Lưu ID đề thi hiện đang được chỉnh sửa hoặc thêm mới. Nếu null tức là đang tạo đề thi mới
  let selectedQuestionIds = []; // Mảng chứa ID các câu hỏi ca sáng đã được người dùng chọn
  let currentSearchResults = []; // Mảng lưu kết quả câu hỏi ca sáng hiện đang hiển thị sau khi tìm kiếm hoặc lọc
  let currentPage = 1;
  const itemsPerPage = 3;
  let selectedQuestionIds2 = [];
  let currentSearchResults2 = [];

  // Khởi tạo listExam và listQuestion nếu chưa có
  if (typeof listExam === "undefined") {
    const storedExams = localStorage.getItem("listExam");
    listExam = storedExams ? JSON.parse(storedExams) : [];
  }

  if (typeof listQuestion === "undefined") {
    const storedQuestions = localStorage.getItem("listQuestion");
    listQuestion = storedQuestions ? JSON.parse(storedQuestions) : [];
  }

  // Cập nhật số lượng thành viên cho mỗi đề thi
  function updateExamMembers() {
    const memberCount = listAccount.length;

    listExam.forEach((exam) => {
      exam.member = memberCount;
    });

    localStorage.setItem("listExam", JSON.stringify(listExam));
  }

  // Gọi hàm cập nhật khi trang tải
  updateExamMembers();

  // Tạo ID đề thi ngẫu nhiên
  function generateUniqueExamId() {
    while (true) {
      const randomNum = Math.floor(Math.random() * 1000);
      const newId = "exam" + String(randomNum).padStart(3, "0");
      let isUnique = true;
      if (listExam) {
        for (let i = 0; i < listExam.length; i++) {
          if (listExam[i].id === newId) {
            isUnique = false;
            break;
          }
        }
      }
      if (isUnique) return newId;
    }
  }

  // Tìm kiếm câu hỏi ca sáng
  function searchQuestions(query) {
    if (!query || !searchResults) {
      if (searchResults) {
        searchResults.innerHTML = "";
      }
      currentSearchResults = [];
      return;
    }

    const lowerQuery = query.toLowerCase();
    currentSearchResults = (listQuestion || []).filter(function (q) {
      // Kiểm tra nếu câu hỏi đã được chọn
      let isSelected = false;
      for (let i = 0; i < selectedQuestionIds.length; i++) {
        if (selectedQuestionIds[i] === q.id) {
          isSelected = true;
          break;
        }
      }

      return (
        !isSelected &&
        (q.id.toLowerCase().includes(lowerQuery) ||
          q.content.toLowerCase().includes(lowerQuery))
      );
    });

    updateSearchResults();
  }

  // Cập nhật danh sách kết quả tìm kiếm ca sáng
  function updateSearchResults() {
    if (!searchResults) return;

    const htmlArray = currentSearchResults.map(function (q) {
      const checkboxId = "checkbox-" + q.id;

      return (
        '<div class="search-result-item" data-id="' +
        q.id +
        '">' +
        '<div class="checkbox-wrapper">' +
        '<input type="checkbox" class="question-checkbox" data-id="' +
        q.id +
        '" id="' +
        checkboxId +
        '">' +
        '<label for="' +
        checkboxId +
        '" class="checkbox-label"></label>' +
        "</div>" +
        '<span class="question-text">' +
        q.id +
        ": " +
        q.content +
        "</span>" +
        "</div>"
      );
    });

    searchResults.innerHTML = htmlArray.join("");
  }

  // Cập nhật danh sách câu hỏi đã chọn ca sáng
  function updateSelectedQuestions() {
    if (!selectedQuestions || !selectedCount) return;

    let html = "";

    for (let i = 0; i < selectedQuestionIds.length; i++) {
      const id = selectedQuestionIds[i];
      let question = null;

      // Tìm câu hỏi tương ứng trong listQuestion
      for (let j = 0; j < (listQuestion || []).length; j++) {
        if (listQuestion[j].id === id) {
          question = listQuestion[j];
          break;
        }
      }

      // Nếu tìm được thì thêm vào HTML
      if (question) {
        html +=
          '<div class="selected-question-item">' +
          id +
          ": " +
          question.content +
          "</div>";
      }
    }

    // Cập nhật giao diện danh sách câu hỏi đã chọn
    selectedQuestions.innerHTML = html;

    // Cập nhật số lượng câu hỏi
    selectedCount.textContent = selectedQuestionIds.length;
  }

  // Tìm kiếm câu hỏi ca chiều
  function searchQuestions2(query) {
    if (!query || !searchResults2) {
      if (searchResults2) {
        searchResults2.innerHTML = "";
      }
      currentSearchResults2 = [];
      return;
    }

    query = query.toLowerCase();

    currentSearchResults2 = (listQuestion || []).filter(function (q) {
      // Kiểm tra xem q.id có nằm trong selectedQuestionIds2 không
      let isSelected = false;
      for (let i = 0; i < selectedQuestionIds2.length; i++) {
        if (selectedQuestionIds2[i] === q.id) {
          isSelected = true;
          break;
        }
      }

      let idMatch = q.id.toLowerCase().indexOf(query) !== -1;
      let contentMatch = q.content.toLowerCase().indexOf(query) !== -1;

      return !isSelected && (idMatch || contentMatch);
    });

    updateSearchResults2();
  }

  // Cập nhật danh sách kết quả tìm kiếm ca chiều
  function updateSearchResults2() {
    if (!searchResults2) return;

    // Tạo ra chuỗi HTML cho từng kết quả tìm kiếm trong currentSearchResults2
    let html = currentSearchResults2
      .map(function (q) {
        return (
          '<div class="search-result-item" data-id="' +
          q.id +
          '">' +
          '<div class="checkbox-wrapper">' +
          '<input type="checkbox" class="question-checkbox" data-id="' +
          q.id +
          '" id="checkbox2-' +
          q.id +
          '">' +
          '<label for="checkbox2-' +
          q.id +
          '" class="checkbox-label"></label>' +
          "</div>" +
          '<span class="question-text">' +
          q.id +
          ": " +
          q.content +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    // Gán chuỗi HTML vừa tạo vào phần tử searchResults2
    searchResults2.innerHTML = html;
  }

  // Cập nhật danh sách câu hỏi đã chọn ca chiều
  function updateSelectedQuestions2() {
    // Nếu không có phần tử để hiển thị hoặc đếm thì thoát
    if (!selectedQuestions2 || !selectedCount2) return;

    let html = "";

    // Duyệt từng id trong danh sách câu hỏi đã chọn
    for (let i = 0; i < selectedQuestionIds2.length; i++) {
      let id = selectedQuestionIds2[i];
      let question = null;

      // Tìm câu hỏi tương ứng trong listQuestion
      for (let j = 0; j < (listQuestion || []).length; j++) {
        if (listQuestion[j].id === id) {
          question = listQuestion[j];
          break; // tìm được thì thoát vòng lặp
        }
      }

      // Nếu tìm thấy câu hỏi thì thêm vào html
      if (question) {
        html +=
          '<div class="selected-question-item">' +
          id +
          ": " +
          question.content +
          "</div>";
      }
    }

    // Cập nhật nội dung HTML cho phần tử selectedQuestions2
    selectedQuestions2.innerHTML = html;

    // Cập nhật số lượng câu hỏi đã chọn
    selectedCount2.textContent = selectedQuestionIds2.length;
  }

  // Hiển thị bảng nội dung
  function renderContent(renderList) {
    if (!contentList) return;
    contentList.innerHTML = "";
    const totalItems = renderList.length;
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, totalItems);
    let html = "";
    for (let i = start; i < end && i < totalItems; i++) {
      let item = renderList[i];
      html +=
        "<tr>" +
        "<td>" +
        item.id +
        "</td>" +
        "<td>" +
        item.title +
        "</td>" +
        "<td>" +
        item.durationMinutes +
        " phút</td>" +
        "<td>" +
        item.totalQuest +
        "</td>" +
        '<td class="action-buttons">' +
        '<button class="btn-edit" data-id="' +
        item.id +
        '"><i class="fa-solid fa-pen-to-square" style="color: #3e1ce9;"></i></button>' +
        '<button class="btn-delete" data-id="' +
        item.id +
        '"><i class="fa-solid fa-trash" style="color: #ff0000;"></i></button>' +
        "</td>" +
        "</tr>";
    }
    contentList.innerHTML = html;
    renderPagination(renderList);
  }

  // Hiển thị phân trang
  function renderPagination(renderList) {
    if (!pageNumbersContainer) return;

    const totalItems = renderList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    pageNumbersContainer.innerHTML = "";

    // Xác định trang bắt đầu và kết thúc hiển thị (tối đa 5 trang)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    let html = "";

    // Nếu startPage > 1, hiển thị nút trang 1 và dấu ...
    if (startPage > 1) {
      html += '<button class="page-button" data-page="1">1</button>';
      if (startPage > 2) {
        html += "<span>...</span>";
      }
    }

    // Tạo các nút trang từ startPage đến endPage
    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === currentPage ? "active" : "";
      html +=
        '<button class="page-button ' +
        activeClass +
        '" data-page="' +
        i +
        '">' +
        i +
        "</button>";
    }

    // Nếu endPage < totalPages, hiển thị dấu ... và nút trang cuối
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += "<span>...</span>";
      }
      html +=
        '<button class="page-button" data-page="' +
        totalPages +
        '">' +
        totalPages +
        "</button>";
    }

    // Cập nhật nội dung phân trang
    pageNumbersContainer.innerHTML = html;

    // Thiết lập sự kiện cho các nút phân trang và cập nhật trạng thái nút
    setupPaginationEvents(renderList);
    updateButtons(totalPages);
  }

  // Thiết lập sự kiện phân trang
  function setupPaginationEvents(renderList) {
    if (!pageNumbersContainer) return;

    // Lấy tất cả nút trang
    const pageButtons =
      pageNumbersContainer.getElementsByClassName("page-button");

    // Gán sự kiện click cho từng nút trang
    for (let i = 0; i < pageButtons.length; i++) {
      pageButtons[i].addEventListener("click", function () {
        currentPage = parseInt(this.getAttribute("data-page"));
        renderContent(renderList);
      });
    }

    // Nút chuyển đến trang đầu
    if (firstPageBtn) {
      firstPageBtn.onclick = function () {
        currentPage = 1;
        renderContent(renderList);
      };
    }

    // Nút chuyển đến trang trước
    if (prevPageBtn) {
      prevPageBtn.onclick = function () {
        if (currentPage > 1) {
          currentPage--;
          renderContent(renderList);
        }
      };
    }

    // Nút chuyển đến trang sau
    if (nextPageBtn) {
      nextPageBtn.onclick = function () {
        const totalPages = Math.ceil(renderList.length / itemsPerPage);
        if (currentPage < totalPages) {
          currentPage++;
          renderContent(renderList);
        }
      };
    }

    // Nút chuyển đến trang cuối
    if (lastPageBtn) {
      lastPageBtn.onclick = function () {
        currentPage = Math.ceil(renderList.length / itemsPerPage);
        renderContent(renderList);
      };
    }
  }

  // Cập nhật trạng thái nút phân trang
  function updateButtons(totalPages) {
    if (firstPageBtn) firstPageBtn.disabled = currentPage === 1; // Vô hiệu hóa nút "Trang đầu/trước" nếu đang ở trang 1
    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages; // Vô hiệu hóa nút "Trang sau/cuối" nếu đang ở trang cuối
    if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
  }

  // Cập nhật bảng
  function updateExamTable(renderList) {
    // Nếu không có renderList truyền vào, dùng danh sách mặc định
    if (!renderList) renderList = listExam;
    currentPage = 1;
    renderContent(renderList);
  }

  // Sự kiện tìm kiếm câu hỏi ca sáng
  if (questionSearch) {
    // Tắt gợi ý tự động của trình duyệt
    questionSearch.setAttribute("autocomplete", "off");

    // Khi người dùng nhập vào input -> gọi hàm tìm kiếm
    questionSearch.addEventListener("input", function () {
      searchQuestions(questionSearch.value);
    });

    // Khi người dùng focus vào input -> hiển thị tất cả câu hỏi chưa chọn
    questionSearch.addEventListener("focus", function () {
      currentSearchResults = (listQuestion || []).filter(function (q) {
        let isSelected = false;
        for (let i = 0; i < selectedQuestionIds.length; i++) {
          if (selectedQuestionIds[i] === q.id) {
            isSelected = true;
            break;
          }
        }
        return !isSelected;
      });
      updateSearchResults();
    });
  }

  // Chọn tất cả kết quả tìm kiếm ca sáng
  const selectAllBtn = document.getElementsByClassName("btn-select-all")[0];

  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", function () {
      if (!searchResults) return;

      // Lấy tất cả checkbox trong kết quả tìm kiếm
      const checkboxes =
        searchResults.getElementsByClassName("question-checkbox");

      for (let i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
          checkboxes[i].checked = true;

          let id = checkboxes[i].getAttribute("data-id");

          // Kiểm tra xem id đã có trong selectedQuestionIds chưa
          let alreadySelected = false;
          for (let j = 0; j < selectedQuestionIds.length; j++) {
            if (selectedQuestionIds[j] === id) {
              alreadySelected = true;
              break;
            }
          }

          // Nếu chưa có thì thêm vào
          if (!alreadySelected) {
            selectedQuestionIds.push(id);
          }
        }
      }

      // Cập nhật danh sách câu hỏi đã chọn
      updateSelectedQuestions();
    });
  }

  // Bỏ chọn tất cả ca sáng
  const deselectAllBtn = document.getElementsByClassName("btn-deselect-all")[0];

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener("click", function () {
      if (!searchResults) return;

      // Lấy tất cả checkbox trong kết quả tìm kiếm
      const checkboxes =
        searchResults.getElementsByClassName("question-checkbox");

      // Bỏ chọn từng checkbox
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }

      // Xóa danh sách câu hỏi đã chọn
      selectedQuestionIds = [];
      updateSelectedQuestions();
    });
  }

  // Thêm hoặc bỏ câu hỏi đã chọn ca sáng
  if (searchResults) {
    searchResults.addEventListener("change", function (e) {
      // Chỉ xử lý khi phần tử thay đổi là checkbox câu hỏi
      if (e.target.className === "question-checkbox") {
        let id = e.target.getAttribute("data-id");

        if (e.target.checked) {
          // Nếu được tick mà chưa có trong danh sách thì thêm vào
          let exists = false;
          for (let i = 0; i < selectedQuestionIds.length; i++) {
            if (selectedQuestionIds[i] === id) {
              exists = true;
              break;
            }
          }

          if (!exists) {
            selectedQuestionIds.push(id);
          }
        } else {
          // Nếu bị bỏ chọn thì tạo mảng mới không chứa id đó
          let newArray = [];
          for (let i = 0; i < selectedQuestionIds.length; i++) {
            if (selectedQuestionIds[i] !== id) {
              newArray.push(selectedQuestionIds[i]);
            }
          }
          selectedQuestionIds = newArray;
        }

        // Cập nhật lại giao diện danh sách đã chọn
        updateSelectedQuestions();
      }
    });
  }

  // Xử lý sự kiện cho bảng
  const examTable = document.querySelector("#Exam-Question .admin-table");

  if (examTable) {
    examTable.addEventListener("click", async function (e) {
      let button = e.target;

      // Tìm chính xác phần tử BUTTON (trong trường hợp click vào icon bên trong button)
      if (button.tagName !== "BUTTON") {
        button = button.parentElement;
        if (button.tagName !== "BUTTON") return;
      }

      // Tìm hàng <tr> chứa nút được bấm
      let row = button;
      for (let i = 0; i < 3; i++) {
        row = row.parentElement;
        if (row.tagName === "TR") break;
      }
      if (row.tagName !== "TR") return;

      // Lấy ID của bài thi từ cột đầu tiên trong hàng
      const examId = row.cells[0].textContent;

      // Tìm bài thi tương ứng trong listExam
      let exam = null;
      for (let i = 0; i < (listExam || []).length; i++) {
        if (listExam[i].id === examId) {
          exam = listExam[i];
          break;
        }
      }

      // Nếu là nút chỉnh sửa
      if (button.className === "btn-edit") {
        if (exam && modal && modalTitle && examTitle && examDuration) {
          currentExamId = exam.id;
          modalTitle.textContent = "Chỉnh sửa bài thi";
          examTitle.value = exam.title;
          examDuration.value = exam.durationMinutes;

          // Gán lại danh sách câu hỏi ca sáng
          selectedQuestionIds = [];
          for (let i = 0; i < exam.questionIds.length; i++) {
            selectedQuestionIds.push(exam.questionIds[i]);
          }

          // Gán lại danh sách câu hỏi ca chiều
          selectedQuestionIds2 = [];
          for (let i = 0; i < exam.questionIds2.length; i++) {
            selectedQuestionIds2.push(exam.questionIds2[i]);
          }

          updateSelectedQuestions();
          updateSelectedQuestions2();
          modal.classList.add("show");
        }

        // Nút xóa
      } else if (button.className === "btn-delete") {
        const result = await Swal.fire({
          title: "Xác nhận xóa?",
          text: "Nếu bạn chọn xóa thì không thể hoàn tác!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
        });

        if (result.isConfirmed && listExam) {
          // Tìm vị trí đề thi cần xóa trong mảng
          let index = -1;
          for (let i = 0; i < listExam.length; i++) {
            if (listExam[i].id === examId) {
              index = i;
              break;
            }
          }

          // Nếu tìm thấy thì xóa
          if (index !== -1) {
            listExam.splice(index, 1);
            localStorage.setItem("listExam", JSON.stringify(listExam));
            if (examSearch) examSearch.value = "";
            updateExamTable();
            Swal.fire("Đã xóa!", "Đề thi đã được xóa.", "success");
          }
        }
      }
    });
  }

  // Sự kiện nút thêm đề thi
  const addExamBtn = document.querySelector("#Exam-Question .btn-add");

  // Kiểm tra nút có tồn tại mới gán sự kiện click
  if (addExamBtn) {
    addExamBtn.onclick = () => {
      // Nếu modal, modalTitle hoặc examForm chưa được khởi tạo thì thoát
      if (!modal || !modalTitle || !examForm) return;

      modalTitle.textContent = "Thêm bài thi mới";

      // Reset lại form nhập liệu
      examForm.reset();

      // Xóa id đề thi hiện tại để thêm mới
      currentExamId = null;

      selectedQuestionIds = [];
      selectedQuestionIds2 = [];

      updateSelectedQuestions();
      updateSelectedQuestions2();

      modal.classList.add("show");
    };
  }

  // Sự kiện đóng modal
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      if (modal) modal.classList.remove("show"); // Xóa class show khỏi modal, tức ẩn
    });
  }

  // Xử lý lưu đề thi
  if (examForm) {
    examForm.onsubmit = async (e) => {
      e.preventDefault();

      // Lấy tiêu đề và thời gian làm bài từ input
      const title = examTitle ? examTitle.value.trim() : "";
      const duration = examDuration ? parseInt(examDuration.value) : 0;

      // Validate
      if (isNaN(duration) || duration <= 0) {
        await Swal.fire("Lỗi!", "Thời gian phải lớn hơn 0 phút.", "error");
        return;
      }

      let isTitleDuplicate = false;
      for (let i = 0; i < (listExam || []).length; i++) {
        if (
          listExam[i].title.toLowerCase() === title.toLowerCase() &&
          listExam[i].id !== currentExamId
        ) {
          isTitleDuplicate = true;
          break;
        }
      }

      if (isTitleDuplicate) {
        await Swal.fire("Lỗi!", "Tên đề thi đã tồn tại.", "error");
        return;
      }

      // Tạo đối tượng dữ liệu đề thi mới hoặc cập nhật
      const examData = {
        title: title,
        durationMinutes: duration,
        questionIds: selectedQuestionIds,
        questionIds2: selectedQuestionIds2,
        randomize: true,
        member: listAccount.length, // Số lượng thành viên
        totalQuest: selectedQuestionIds.length + selectedQuestionIds2.length,
      };

      if (currentExamId && listExam) {
        // Cập nhật đề thi đã có
        let index = -1;
        for (let i = 0; i < listExam.length; i++) {
          if (listExam[i].id === currentExamId) {
            index = i;
            break;
          }
        }

        if (index !== -1) {
          // Giữ id, cập nhật các thuộc tính khác
          listExam[index] = { id: currentExamId };
          for (let key in examData) {
            listExam[index][key] = examData[key];
          }
          await Swal.fire("Thành công!", "Đã cập nhật đề thi!", "success");
        }
      } else if (listExam) {
        // Thêm đề thi mới
        examData.id = generateUniqueExamId();
        listExam.unshift(examData);
        await Swal.fire("Thành công!", "Đã thêm đề thi mới!", "success");
      }

      // Lưu danh sách đề thi vào localStorage
      if (listExam) {
        localStorage.setItem("listExam", JSON.stringify(listExam));
      }

      // Xóa ô tìm kiếm đề thi nếu có
      if (examSearch) {
        examSearch.value = "";
      }
      updateExamTable();
      // Ẩn modal
      if (modal) {
        modal.classList.remove("show");
      }
    };
  }

  // Tìm kiếm đề thi
  if (examSearch) {
    examSearch.oninput = () => {
      const query = examSearch.value.toLowerCase();
      // Lọc đề thi theo id hoặc title có chứa query
      const filteredExams = (listExam || []).filter((exam) => {
        return (
          exam.id.toLowerCase().includes(query) ||
          exam.title.toLowerCase().includes(query)
        );
      });
      // Đặt trang hiện tại về 1 rồi render danh sách đề thi lọc được
      currentPage = 1;
      renderContent(filteredExams);
    };
  }

  // Xử lý tìm kiếm câu hỏi ca chiều (questionSearch2)
  const questionSearch2 = document.getElementById("questionSearch2");
  if (questionSearch2) {
    questionSearch2.setAttribute("autocomplete", "off");
    // Khi nhập, gọi hàm tìm kiếm với giá trị input
    questionSearch2.oninput = () => {
      searchQuestions2(questionSearch2.value);
    };
    // Khi focus vào input, hiển thị tất cả câu hỏi chưa chọn
    questionSearch2.onfocus = () => {
      currentSearchResults2 = (listQuestion || []).filter((q) => {
        // Loại bỏ câu hỏi đã chọn trong selectedQuestionIds2
        return !selectedQuestionIds2.includes(q.id);
      });
      updateSearchResults2();
    };
  }

  // Nút chọn tất cả câu hỏi ca chiều
  const selectAllBtn2 = document.getElementsByClassName("btn-select-all2")[0];
  if (selectAllBtn2) {
    selectAllBtn2.onclick = () => {
      if (!searchResults2) return;

      const checkboxes =
        searchResults2.getElementsByClassName("question-checkbox");
      for (let i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
          checkboxes[i].checked = true;

          let id = checkboxes[i].getAttribute("data-id");
          // Nếu chưa có trong selectedQuestionIds2 thì thêm vào
          if (!selectedQuestionIds2.includes(id)) {
            selectedQuestionIds2.push(id);
          }
        }
      }
      updateSelectedQuestions2();
    };
  }

  // Nút bỏ chọn tất cả câu hỏi ca chiều
  const deselectAllBtn2 =
    document.getElementsByClassName("btn-deselect-all2")[0];
  if (deselectAllBtn2) {
    deselectAllBtn2.onclick = () => {
      if (!searchResults2) return;

      const checkboxes =
        searchResults2.getElementsByClassName("question-checkbox");

      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }
      // Xóa hết danh sách câu hỏi đã chọn
      selectedQuestionIds2 = [];
      updateSelectedQuestions2();
    };
  }

  // Xử lý chọn hoặc bỏ chọn từng câu hỏi ca chiều
  if (searchResults2) {
    searchResults2.onchange = (e) => {
      if (e.target.className === "question-checkbox") {
        let id = e.target.getAttribute("data-id");

        if (e.target.checked) {
          // Thêm câu hỏi vào ds nếu chưa có
          if (!selectedQuestionIds2.includes(id)) {
            selectedQuestionIds2.push(id);
          }
        } else {
          // Bỏ câu hỏi
          selectedQuestionIds2 = selectedQuestionIds2.filter(
            (qid) => qid !== id
          );
        }
        updateSelectedQuestions2();
      }
    };
  }

  // Khởi tạo bảng danh sách đề thi ban đầu
  updateExamTable();
});
