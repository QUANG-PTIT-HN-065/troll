function formatRelativeDate(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    return `${Math.max(0, months)} months ago`;
}

document.addEventListener('DOMContentLoaded', () => {
    // Hàm mở modal
    function openModal(modal) {
        if (modal) {
            modal.classList.remove('hidden');
            console.log(`Modal opened: ${modal.id || modal.className}`);
        } else {
            console.error('Modal not found');
        }
    }

    // Hàm đóng modal
    function closeModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
            console.log(`Modal closed: ${modal.id || modal.className}`);
        } else {
            console.error('Modal not found');
        }
    }

    // Hàm tạo ID tự động cho câu hỏi
    function generateQuestionId(questions) {
        let newId;
        let existingIds = new Set(questions.map(q => q.id));
        do {
            const randomNum = Math.floor(Math.random() * 900) + 100;
            newId = `q${randomNum}`;
        } while (existingIds.has(newId));
        return newId;
    }

    // Hàm cập nhật hiển thị đáp án dựa trên số lượng
    function updateAnswerFields(modalId, answerCount) {
        const form = document.querySelector(`#${modalId} .modal-form-${modalId === 'addQuestionModal' ? 'add' : 'edit'}`);
        const answerGroups = form.querySelectorAll('.answer-group');
        const radioGroup = form.querySelector(`#${modalId === 'addQuestionModal' ? 'addCorrectAnswerGroup' : 'editCorrectAnswerGroup'}`);
        const radios = radioGroup.querySelectorAll('input[name$="CorrectAnswer"]');

        answerGroups.forEach((group, index) => {
            if (index < answerCount) {
                group.style.display = 'block';
                group.querySelector('input').required = true;
            } else {
                group.style.display = 'none';
                group.querySelector('input').required = false;
                group.querySelector('input').value = '';
            }
        });

        radios.forEach((radio, index) => {
            const label = radio.parentElement;
            if (index < answerCount) {
                label.style.display = 'inline-block';
            } else {
                label.style.display = 'none';
                radio.checked = false;
            }
        });
    }

    // Hàm gắn sự kiện cho bảng Question
    function setupQuestionTableEvents() {
        const table = document.querySelector('#Question .admin-table');
        if (!table) {
            console.error('Table #Question .admin-table not found');
            return;
        }

        table.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const row = button.closest('tr');
            if (!row) {
                console.error('Row not found for button');
                return;
            }
            const id = row.cells[0].textContent;

            if (button.classList.contains('btn-edit')) {
                const question = listQuestion.find(q => q.id === id);
                if (question) {
                    const editQuestionForm = document.getElementById('editQuestionForm');
                    const editQuestionText = document.getElementById('editQuestionText');
                    const editAnswer1 = document.getElementById('editAnswer1');
                    const editAnswer2 = document.getElementById('editAnswer2');
                    const editAnswer3 = document.getElementById('editAnswer3');
                    const editAnswer4 = document.getElementById('editAnswer4');
                    const editCorrectAnswerRadios = document.getElementsByName('editCorrectAnswer');
                    const editAnswerCount = document.getElementById('editAnswerCount');

                    if (!editQuestionForm || !editQuestionText || !editAnswer1 || !editAnswer2 || !editAnswerCount) {
                        console.error('One or more form elements not found in editQuestionModal');
                        return;
                    }

                    // Reset form
                    editQuestionForm.reset();
                    // Populate fields
                    editQuestionText.value = question.content || '';
                    editAnswer1.value = question.options && question.options[0] ? question.options[0] : '';
                    editAnswer2.value = question.options && question.options[1] ? question.options[1] : '';
                    editAnswer3.value = question.options && question.options[2] ? question.options[2] : '';
                    editAnswer4.value = question.options && question.options[3] ? question.options[3] : '';
                    document.getElementById('editQuestionId').value = question.id;
                    editAnswerCount.value = question.answerCount || 4;

                    // Set correct answer radio
                    const correctIndex = question.options.indexOf(question.correctAnswer);
                    if (correctIndex !== -1) {
                        editCorrectAnswerRadios[correctIndex].checked = true;
                    }

                    // Update answer fields visibility
                    updateAnswerFields('editQuestionModal', parseInt(editAnswerCount.value));

                    openModal(document.getElementById('editQuestionModal'));
                } else {
                    console.error(`Question with ID ${id} not found in listQuestion`);
                }
            } else if (button.classList.contains('btn-delete')) {
                openModal(document.getElementById('deleteQuestionModal'));
                const confirmDelete = document.getElementById('confirmDelete');
                if (confirmDelete) {
                    confirmDelete.onclick = () => {
                        const index = listQuestion.findIndex(q => q.id === id);
                        if (index !== -1) {
                            listQuestion.splice(index, 1);
                            localStorage.setItem('listQuestion', JSON.stringify(listQuestion));
                            init(listQuestion, 'Question', 'questionTableBody');
                            closeModal(document.getElementById('deleteQuestionModal'));
                        }
                    };
                } else {
                    console.error('Element #confirmDelete not found');
                }
            }
        });
    }

    // Hàm gắn sự kiện cho bảng Article
    function setupArticleTableEvents() {
        const table = document.querySelector('#Article .admin-table');
        if (!table) {
            console.error('Table #Article .admin-table not found');
            return;
        }

        table.addEventListener('click', (e) => {
            console.log('Article table clicked:', e.target);
            const button = e.target.closest('button');
            if (!button) return;

            const row = button.closest('tr');
            if (!row) {
                console.error('Row not found for button');
                return;
            }
            const id = parseInt(row.cells[0].textContent);
            const articles = getArticleList();
            const article = articles.find(a => a.id === id);

            if (!article) {
                console.error(`Article with ID ${id} not found`);
                return;
            }

            if (button.classList.contains('btn-edit')) {
                currentEditId = id;
                if (formEdit) {
                    formEdit.querySelector('input[name="title"]').value = article.title;
                    formEdit.querySelector('input[name="content"]').value = article.content;
                    formEdit.querySelector('input[name="date"]').value = article.date;
                    formEdit.querySelector('input[name="time"]').value = article.time;
                    formEdit.querySelector('input[name="author"]').value = article.author;
                    openModal(modalEdit);
                } else {
                    console.error('Form edit article not found');
                }
            } else if (button.classList.contains('btn-delete')) {
                currentDeleteId = id;
                openModal(modalDelete);
            }
        });
    }

    // Hàm init cho phân trang
    function init(renderList, nameList, nameId) {
        const itemsPerPage = 5;
        let currentPage = 1;
        const totalItems = renderList.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const contentList = document.getElementById(nameId);
        if (!contentList) {
            console.error(`Content list with ID ${nameId} not found`);
            return;
        }

        const firstPageBtn = document.getElementById(`${nameList}-firstPage`);
        const prevPageBtn = document.getElementById(`${nameList}-prevPage`);
        const nextPageBtn = document.getElementById(`${nameList}-nextPage`);
        const lastPageBtn = document.getElementById(`${nameList}-lastPage`);
        const pageNumbersContainer = document.getElementById(`${nameList}-pageNumbers`);

        function renderContent() {
            contentList.innerHTML = '';
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const itemsToShow = renderList.slice(start, end);

            itemsToShow.forEach((item) => {
                contentList.innerHTML += generateRow(item, nameList);
            });
            renderPagination();
            if (nameList === 'Question') {
                setupQuestionTableEvents();
            } else if (nameList === 'Article') {
                setupArticleTableEvents();
            }
        }

        function generateRow(item, nameList) {
            switch (nameList) {
                case 'Students':
                    return `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.nameUser}</td>
                        <td>${item.email}</td>
                        <td>Sinh viên</td>
                        <td class="action-buttons">
                            <button class="btn-delete" onclick="lockuser(${item.id})">
                                ${item.status ? '<i class="fa-solid fa-lock-open"></i>' : '<i class="fa-solid fa-lock"></i>'}
                            </button>
                        </td>
                        <td class="action-buttons">
                            <button class="btn-delete" onclick="seeDetails(${item.id})">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                        </td>
                    </tr>`;
                case 'Exam-Question':
                    return `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.title}</td>
                        <td>${item.durationMinutes} minutes</td>
                        <td>${item.totalQuest}</td>
                        <td class="action-buttons">
                            <button class="btn-edit" data-id="${item.id}"><i class="fa-solid fa-pen-to-square" style="color: #3e1ce9;"></i></button>
                            <button class="btn-delete" data-id="${item.id}"><i class="fa-solid fa-trash" style="color: #ff0000;"></i></button>
                        </td>
                    </tr>`;
                case 'Question':
                    return `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.content}</td>
                        <td>${item.answerCount || 4}</td>
                        <td class="action-buttons">
                            <button class="btn-edit" data-id="${item.id}"><i class="fa-solid fa-pen-to-square" style="color: #3e1ce9;"></i></button>
                            <button class="btn-delete" data-id="${item.id}"><i class="fa-solid fa-trash" style="color: #ff0000;"></i></button>
                        </td>
                    </tr>`;
                case 'Article':
                    return `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.title}</td>
                        <td>${item.date}</td>
                        <td>${item.author}</td>
                        <td class="action-buttons">
                            <button class="btn-edit" data-id="${item.id}"><i class="fa-solid fa-pen-to-square" style="color: #3e1ce9;"></i></button>
                            <button class="btn-delete" data-id="${item.id}"><i class="fa-solid fa-trash" style="color: #ff0000;"></i></button>
                        </td>
                    </tr>`;
                default:
                    return '';
            }
        }

        function renderPagination() {
            pageNumbersContainer.innerHTML = '';
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + 4);

            if (startPage > 1) {
                pageNumbersContainer.innerHTML += `<button class="page-button" data-page="1">1</button>`;
                if (startPage > 2) pageNumbersContainer.innerHTML += `<span>...</span>`;
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbersContainer.innerHTML += `
                    <button class="page-button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pageNumbersContainer.innerHTML += `<span>...</span>`;
                pageNumbersContainer.innerHTML += `<button class="page-button" data-page="${totalPages}">${totalPages}</button>`;
            }

            setupPaginationEvents();
            updateButtons();
        }

        function setupPaginationEvents() {
            const pageButtons = pageNumbersContainer.querySelectorAll('.page-button');
            pageButtons.forEach(button => {
                button.addEventListener('click', () => {
                    currentPage = parseInt(button.dataset.page);
                    renderContent();
                });
            });

            if (firstPageBtn) firstPageBtn.onclick = () => { currentPage = 1; renderContent(); };
            if (prevPageBtn) prevPageBtn.onclick = () => { if (currentPage > 1) currentPage--; renderContent(); };
            if (nextPageBtn) nextPageBtn.onclick = () => { if (currentPage < totalPages) currentPage++; renderContent(); };
            if (lastPageBtn) lastPageBtn.onclick = () => { currentPage = totalPages; renderContent(); };
        }

        function updateButtons() {
            if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
            if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
            if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
            if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
        }

        renderContent();
    }
    function seeDetails(id) {
        console.log('See details button clicked for ID:', id);
    }
    // Xử lý nav links
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');

            const linkText = this.querySelector('span').textContent.trim();
            let sectionId;

            switch (linkText) {
                case 'Bảng điều khiển':
                    sectionId = 'Dashboard';
                    localStorage.setItem('currentSection', 'Dashboard');
                    location.reload();
                    break;
                case 'Sinh viên':
                    sectionId = 'Students';
                    break;
                case 'Bài thi':
                    sectionId = 'Exam-Question';
                    break;
                case 'Câu hỏi':
                    sectionId = 'Question';
                    break;
                case 'Bài viết':
                    sectionId = 'Article';
                    break;
                default:
                    sectionId = 'Dashboard';
            }

            sections.forEach(section => section.classList.add('none'));
            const selectedSection = document.getElementById(sectionId);
            if (selectedSection) {
                selectedSection.classList.remove('none');
                switch (linkText) {
                    case 'Sinh viên':
                        init(listAccount, 'Students', 'userTableBody');
                        break;
                    case 'Bài thi':
                        init(listExam, 'Exam-Question', 'examTableBody');
                        break;
                    case 'Câu hỏi':
                        init(listQuestion, 'Question', 'questionTableBody');
                        break;
                    case 'Bài viết':
                        const articles = getArticleList();
                        init(articles, 'Article', 'articleTableBody');
                        break;
                }
            }
        });
    });


    // Xử lý modal cho Question
    const btnAddQuestion = document.querySelector('#Question .btn-add');
    const modalAddQuestion = document.getElementById('addQuestionModal');
    const modalEditQuestion = document.getElementById('editQuestionModal');
    const modalDeleteQuestion = document.getElementById('deleteQuestionModal');
    const formAddQuestion = document.getElementById('addQuestionForm');
    const formEditQuestion = document.getElementById('editQuestionForm');
    const btnCloseAddQuestion = modalAddQuestion ? modalAddQuestion.querySelector('.btn-close') : null;
    const btnCloseEditQuestion = modalEditQuestion ? modalEditQuestion.querySelector('.btn-close') : null;
    const btnCloseDeleteQuestion = modalDeleteQuestion ? modalDeleteQuestion.querySelector('.btn-close-delete') : null;

    if (btnAddQuestion) {
        console.log('Add question button found');
        btnAddQuestion.addEventListener('click', () => {
            console.log('Opening add question modal');
            if (modalAddQuestion && formAddQuestion) {
                openModal(modalAddQuestion);
                formAddQuestion.reset();
                document.getElementById('addAnswerCount').value = '4';
                updateAnswerFields('addQuestionModal', 4);
            } else {
                console.error('Add question modal or form not found');
            }
        });
    } else {
        console.error('Add question button not found');
    }

    if (btnCloseAddQuestion) {
        btnCloseAddQuestion.addEventListener('click', () => {
            closeModal(modalAddQuestion);
            formAddQuestion?.reset();
            updateAnswerFields('addQuestionModal', 4);
        });
    }

    if (btnCloseEditQuestion) {
        btnCloseEditQuestion.addEventListener('click', () => {
            closeModal(modalEditQuestion);
            formEditQuestion?.reset();
            updateAnswerFields('editQuestionModal', 4);
        });
    }

    if (btnCloseDeleteQuestion) {
        btnCloseDeleteQuestion.addEventListener('click', () => {
            closeModal(modalDeleteQuestion);
        });
    }

    // Xử lý thay đổi số lượng đáp án
    const addAnswerCountSelect = document.getElementById('addAnswerCount');
    if (addAnswerCountSelect) {
        addAnswerCountSelect.addEventListener('change', (e) => {
            updateAnswerFields('addQuestionModal', parseInt(e.target.value));
        });
    }

    const editAnswerCountSelect = document.getElementById('editAnswerCount');
    if (editAnswerCountSelect) {
        editAnswerCountSelect.addEventListener('change', (e) => {
            updateAnswerFields('editQuestionModal', parseInt(e.target.value));
        });
    }

    if (formAddQuestion) {
        formAddQuestion.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Add question form submitted');
            const content = document.getElementById('addQuestionText').value;
            const answerCount = parseInt(document.getElementById('addAnswerCount').value);
            const options = [];
            for (let i = 1; i <= answerCount; i++) {
                const answer = document.getElementById(`addAnswer${i}`).value;
                if (!answer) {
                    showErrorModal('Vui lòng điền đầy đủ các đáp án');
                    return;
                }
                options.push(answer);
            }
            const correctAnswerRadio = document.querySelector('input[name="addCorrectAnswer"]:checked');
            if (!content || !correctAnswerRadio) {
                showErrorModal('Vui lòng điền đầy đủ thông tin và chọn đáp án đúng');
                return;
            }
            const correctAnswer = options[parseInt(correctAnswerRadio.value)];

            const id = generateQuestionId(listQuestion);
            listQuestion.push({ id, content, options, correctAnswer, answerCount });
            localStorage.setItem('listQuestion', JSON.stringify(listQuestion));
            init(listQuestion, 'Question', 'questionTableBody');
            closeModal(modalAddQuestion);
            formAddQuestion.reset();
            updateAnswerFields('addQuestionModal', 4);
        });
    }

    if (formEditQuestion) {
        formEditQuestion.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Edit question form submitted');
            const id = document.getElementById('editQuestionId').value;
            const content = document.getElementById('editQuestionText').value;
            const answerCount = parseInt(document.getElementById('editAnswerCount').value);
            const options = [];
            for (let i = 1; i <= answerCount; i++) {
                const answer = document.getElementById(`editAnswer${i}`).value;
                if (!answer) {
                    showErrorModal('Vui lòng điền đầy đủ các đáp án');
                    return;
                }
                options.push(answer);
            }
            const correctAnswerRadio = document.querySelector('input[name="editCorrectAnswer"]:checked');
            if (!content || !correctAnswerRadio) {
                showErrorModal('Vui lòng điền đầy đủ thông tin và chọn đáp án đúng');
                return;
            }
            const correctAnswer = options[parseInt(correctAnswerRadio.value)];

            const index = listQuestion.findIndex(q => q.id === id);
            if (index !== -1) {
                listQuestion[index] = { id, content, options, correctAnswer, answerCount };
                localStorage.setItem('listQuestion', JSON.stringify(listQuestion));
                init(listQuestion, 'Question', 'questionTableBody');
                closeModal(modalEditQuestion);
                formEditQuestion.reset();
                updateAnswerFields('editQuestionModal', 4);
            }
        });
    }

    // Xử lý modal cho Students
    const btnAddStudent = document.querySelector('#Students .btn-add');
    const modalAddStudent = document.getElementById('addAccountModal');
    const formAddStudent = document.getElementById('addAccountForm');
    const btnCloseStudent = modalAddStudent ? modalAddStudent.querySelector('.btn-close') : null;
    const btnConfirmAddStudent = modalAddStudent ? modalAddStudent.querySelector('#confirmAdd') : null;

    if (btnAddStudent) {
        console.log('Add student button found');
        btnAddStudent.addEventListener('click', () => {
            console.log('Opening add student modal');
            if (modalAddStudent) {
                openModal(modalAddStudent);
                formAddStudent?.reset();
            } else {
                console.error('Add account modal not found');
            }
        });
    } else {
        console.error('Add student button not found');
    }

    if (btnCloseStudent) {
        btnCloseStudent.addEventListener('click', () => {
            closeModal(modalAddStudent);
            formAddStudent?.reset();
        });
    }

    if (btnConfirmAddStudent && formAddStudent) {
        btnConfirmAddStudent.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Add student form submitted');
            if (formAddStudent.checkValidity()) {
                const formData = new FormData(formAddStudent);
                const nameUser = formData.get('username');
                const email = formData.get('email');
                const password = formData.get('password');

                const isDuplicate = listAccount.some(acc => acc.email === email);
                if (isDuplicate) {
                    alert('Tên tài khoản hoặc email đã tồn tại!');
                    return;
                }

                function generateRandomId() {
                    const random3Digit = Math.floor(Math.random() * 900) + 100;
                    let checkId = listAccount.some(acc => acc.id === random3Digit);
                    return checkId ? generateRandomId() : random3Digit;
                }

                const newAccount = {
                    id: generateRandomId(),
                    nameUser,
                    email,
                    password,
                    status: true
                };

                listAccount.push(newAccount);
                listAccount.reverse();
                localStorage.setItem('listAccount', JSON.stringify(listAccount));
                init(listAccount, 'Students', 'userTableBody');
                closeModal(modalAddStudent);
                formAddStudent.reset();
            } else {
                formAddStudent.reportValidity();
            }
        });
    }
    // Xử lý khóa/mở khóa tài khoản
    function lockuser(id) {
        const user = listAccount.find(acc => acc.id === id);
        Swal.fire({
            title: 'Có chắc muốn khóa hay mở khóa tài khoản này',
            showDenyButton: true,
            confirmButtonText: 'Đồng ý',
            denyButtonText: 'Không'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Thay đổi trạng thái tài khoản thành công!', '', 'success');
                if (user) {
                    user.status = !user.status;
                    localStorage.setItem('listAccount', JSON.stringify(listAccount));
                    init(listAccount, 'Students', 'userTableBody');
                }
            } else if (result.isDenied) {
                Swal.fire('Thay đổi trạng thái tài khoản không thành công!', '', 'info');
            }
        });
    }
    window.lockuser = lockuser;
    // Xử lý sidebar responsive
    const menuButton = document.getElementById('menu-nav');
    const closeButton = document.getElementById('close-menu-nav');
    const sidebar = document.querySelector('.sidebar');

    if (menuButton && closeButton) {
        console.log('Sidebar buttons found');
        menuButton.addEventListener('click', () => {
            sidebar.classList.add('open');
            menuButton.style.display = 'none';
            closeButton.style.display = 'block';
        });

        closeButton.addEventListener('click', () => {
            sidebar.classList.remove('open');
            closeButton.style.display = 'none';
            menuButton.style.display = 'block';
        });
    } else {
        console.error('Sidebar buttons not found');
    }

    // Xử lý xem chi tiết sinh viên


    function lockuser(id) {
        const user = listAccount.find(acc => acc.id === id);
        Swal.fire({
            title: "Có chắc muốn khóa hay mở khóa tài khản này",
            showDenyButton: true,
            // showCancelButton: true,
            confirmButtonText: "Đồng ý",
            denyButtonText: `Không`
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire("Thay đổi trạng thái tài khoản thành công!", "", "success");
                if (user) {
                    user.status = !user.status; // Đảo ngược trạng thái
                    localStorage.setItem('listAccount', JSON.stringify(listAccount));

                    // Cập nhật member trong listExam
                    const listExam = JSON.parse(localStorage.getItem('listExam')) || [];
                    listExam.forEach(exam => {
                        exam.member = listAccount.length;
                    });
                    localStorage.setItem('listExam', JSON.stringify(listExam));

                    init(listAccount, 'Students', 'userTableBody');
                }
            } else if (result.isDenied) {
                Swal.fire("Thay đổi trạng thái tài khoản không thành công!", "", "info");
            }
        });
    }
    window.lockuser = lockuser;

    // Mở/đóng modal
    function openModalQues(modal) { document.getElementById(modal).classList.remove('hidden'); }
    function closeModalQues(modal) { document.getElementById(modal).classList.add('hidden'); }

    function openModal(modal) { modal.classList.remove('hidden'); }
    function closeModal(modal) { modal.classList.add('hidden'); }

    // Modal
    const modalAdd1 = document.querySelector('.modal-add');
    const modalEdit1 = document.querySelector('.modal-edit');
    const modalDelete1 = document.querySelector('.modal-delete');

    // Form
    const formAdd1 = document.querySelector('.modal-form-add');
    const formEdit1 = document.querySelector('.modal-form-edit');

    // Button
    const btnAddPost1 = document.querySelector('#Article .btn-add');
    const btnCloseAdd1 = modalAdd1.querySelector('.btn-close');
    const btnCloseEdit1 = modalEdit1.querySelector('.btn-close');
    const btnCloseDelete1 = modalDelete1.querySelector('.btn-close-delete');
    const btnConfirmDelete1 = modalDelete1.querySelector('.btn-confirm-delete');

    // ID tạm để chỉnh sửa/xóa
    let currentEditId1 = null;
    let currentDeleteId1 = null;

    // Nút mở modal
    btnAddPost1.addEventListener('click', () => openModal(modalAdd1));
    btnCloseAdd1.addEventListener('click', () => closeModal(modalAdd1));
    btnCloseEdit1.addEventListener('click', () => closeModal(modalEdit1));
    btnCloseDelete1.addEventListener('click', () => closeModal(modalDelete1));

    // Thêm bài viết
    formAdd1.addEventListener('submit', e => {
        e.preventDefault();
        const [title, content, time, author] = [...formAdd1.querySelectorAll('input')].map(i => i.value.trim());
        const today = new Date().toISOString().split('T')[0];

        if (!title || !content || !time || !author || isNaN(time) || time < 5 || time > 120 || /[a-zA-Z]/.test(time)) {
            showErrorModal('Vui lòng nhập đầy đủ và hợp lệ');
            return;
        }


        const articles = getArticleList();
        const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
        articles.unshift({ id: newId, title, content, date: today, time, author });
        closeModal(modalAdd1);
        saveArticleList(articles);
        init(articles, 'Article', 'articleTableBody');

    });

    // Sửa & Xóa bằng delegation
    document.getElementById('articleTableBody').addEventListener('click', e => {
        const target = e.target.closest('button');
        if (!target) return;

        const id = +target.dataset.id;
        const list = JSON.parse(localStorage.getItem('listArticle')) || [];
        const article = list.find(a => a.id === id);
        if (!article) return;

        if (target.classList.contains('btn-edit')) {
            currentEditId1 = id;
            formEdit1.title.value = article.title;
            formEdit1.content.value = article.content;
            formEdit1.date.value = article.date;
            formEdit1.time.value = article.time;
            formEdit1.author.value = article.author;
            openModal(modalEdit1);
        }

        if (target.classList.contains('btn-delete')) {
            currentDeleteId1 = id;
            openModal(modalDelete1);
        }
    });

    // Cập nhật bài viết
    formEdit1.addEventListener('submit', e => {
        e.preventDefault();
        const [title, content, date, time, author] = [
            formEdit1.title.value.trim(),
            formEdit1.content.value.trim(),
            formEdit1.date.value,
            formEdit1.time.value.trim(),
            formEdit1.author.value.trim()
        ];

        if (!title || !content || !date || !time || !author || isNaN(time) || time < 5 || time > 120 || /[a-zA-Z]/.test(time)) {
            showErrorModal('Thông tin không hợp lệ');
            return;
        }

        const articles = getArticleList();
        const index = articles.findIndex(a => a.id === currentEditId1);
        if (index !== -1) {
            articles[index] = { id: currentEditId1, title, content, date, time, author };
            saveArticleList(articles);
            closeModal(modalEdit1);
            init(articles, 'Article', 'articleTableBody');
        }


    });

    // Xóa bài viết
    btnConfirmDelete1.addEventListener('click', () => {

        let articles = getArticleList();
        articles = articles.filter(a => a.id !== currentDeleteId1);
        saveArticleList(articles);
        closeModal(modalDelete1);
        init(articles, 'Article', 'articleTableBody');

    });

});

function showErrorModal(message) {
    const errorModal = document.querySelector('.modal-error');
    const notification = document.getElementById('notification');

    if (errorModal && notification) {
        notification.textContent = message || 'Có lỗi xảy ra';
        errorModal.classList.add('show');
        setTimeout(() => {
            errorModal.classList.remove('show');
        }, 1500);
    } else {
        console.error('Error modal or notification not found');
    }
}
function seeDetails(id) {
    let user = listAccount.find(acc => acc.id === id);
    let modalDetails = document.getElementById('seeDetails');
    modalDetails.classList.remove('hidden');
    let detailsContent = document.getElementById('pointExam');
    let btn = document.getElementById('closeDetails');
    btn.addEventListener('click', () => {
        modalDetails.classList.add('hidden');
    });
    console.log(user);
    let history = user.history;
    init(history);
}
function getArticleList() {
    return JSON.parse(localStorage.getItem('listArticle')) || [];
}

function saveArticleList(list) {
    localStorage.setItem('listArticle', JSON.stringify(list));
}

function getlistAccount() {
    return JSON.parse(localStorage.getItem('listAccount')) || [];
}

function getlistExam() {
    return JSON.parse(localStorage.getItem('listExam')) || [];
}

window.onload = function () {
    let totalStudent = document.getElementsByClassName("stat-value")[0];
    let listAccount = getlistAccount();
    if (totalStudent) {
        totalStudent.innerHTML = listAccount.length;
    }
    let totalExam = document.getElementsByClassName("stat-value")[1];
    let listExam = getlistExam();
    if (totalExam) {
        totalExam.innerHTML = listExam.length;
    }
};