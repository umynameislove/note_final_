let notes = [];
let selectedNoteId = null;
let debounceTimeout;
let noteIdToDelete = null;
let firstInputHandled = false;

function debounce(func, delay) {
    return function (...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func(...args), delay);
    };
}

function formatTimestamp(date) {
    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).replace(",", "").replace(/\//g, " tháng ");
}

async function fetchNotes() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user ? user.email : '';
        const response = await fetch('http://localhost:4000/api/notes', {
            headers: {
                'Content-Type': 'application/json',
                'user-email': email
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch notes');
        }
        const fetchedNotes = await response.json();
        return fetchedNotes.map(note => ({
            _id: note._id,
            content: note.content,
            title: note.title,
            timestamp: note.timestamp,
            isLocked: note.isLocked
        }));
    } catch (err) {
        console.error('Error fetching notes:', err);
        return [];
    }
}

async function initNotes() {
    notes = await fetchNotes();
    console.log("Fetched notes:", notes); // Kiểm tra dữ liệu
    if (notes.length === 0) {
        const now = new Date();
        const newNote = {
            content: "",
            title: "Ghi chú trống",
            timestamp: formatTimestamp(now)
        };
        await createNoteOnServer(newNote);
        notes = await fetchNotes();
    }
    renderGrid();
    if (notes.length > 0 && notes[0]._id) {
        selectNote(notes[0]._id);
    } else {
        console.warn("No valid notes to select");
    }
}
function renderGrid() {
    const noteGrid = document.getElementById("note-grid");
    if (!noteGrid) {
        console.error("Element with id 'note-grid' not found in the DOM");
        return;
    }
    noteGrid.innerHTML = "";

    let rowDiv = null;
    const notesPerRow = 5;

    notes.forEach((note, index) => {
        if (index % notesPerRow === 0) {
            rowDiv = document.createElement("div");
            rowDiv.className = "note-row flex space-x-4 mb-4";
            noteGrid.appendChild(rowDiv);
        }

        const noteCard = document.createElement("div");
        noteCard.className = `note-card p-4 rounded-lg shadow-md transition cursor-pointer flex flex-col ${selectedNoteId === note._id ? "selected" : ""}`;

        const div = document.createElement("div");
        div.innerHTML = note.content || "";
        let textContent = div.textContent || div.innerText || "";
        textContent = textContent.trim();
        const lines = textContent.split("\n");
        const title = note.title || "Ghi chú trống";
        const preview = lines[1] || "";
        const description = lines[2] || "";

        noteCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex items-center">
                    ${note.isLocked ? '<span class="mr-2">🔒</span>' : ""}
                    <h3 class="font-bold text-lg text-white mb-2">${title.length > 20 ? title.slice(0, 20) + "..." : title}</h3>
                </div>
                <button class="more-btn text-xl px-2">⋮</button>
            </div>
            <p class="text-gray-300 text-sm mb-2 flex-1 overflow-hidden">${preview.length > 50 ? preview.slice(0, 50) + "..." : preview}</p>
            <p class="text-gray-400 text-xs">${description.length > 50 ? description.slice(0, 50) + "..." : description}</p>
            <p class="text-gray-400 text-xs mt-1">${note.timestamp}</p>
            <div class="toast-menu hidden">
                <button class="block w-full px-4 py-2 hover:bg-red-600 text-left text-white delete-btn">Delete</button>
                <button class="block w-full px-4 py-2 hover:bg-blue-600 text-left text-white password-btn">${note.isLocked ? "Remove Password" : "Set Password"}</button>
            </div>
        `;

        noteCard.querySelector(".more-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            const menu = noteCard.querySelector(".toast-menu");
            menu.classList.toggle("hidden");
        });

        noteCard.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation(); // Ngăn sự kiện lan truyền
            if (e.isTrusted && note._id) { // Chỉ xử lý sự kiện từ người dùng và ID hợp lệ
                noteIdToDelete = note._id;
                document.getElementById("delete-modal").classList.remove("hidden");
            } else {
                console.warn("Invalid delete attempt:", { event: e, noteId: note._id });
            }
        });

        noteCard.querySelector(".password-btn").addEventListener("click", () => {
            setPassword(note._id, note.isLocked);
        });

        document.addEventListener("click", (event) => {
            if (!noteCard.contains(event.target)) {
                noteCard.querySelector(".toast-menu").classList.add("hidden");
            }
        });

        noteCard.addEventListener("click", () => selectNote(note._id));
        rowDiv.appendChild(noteCard);
    });
}

async function selectNote(noteId) {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user ? user.email : '';
        const note = notes.find(n => n._id === noteId);
        if (!note) {
            alert('Ghi chú không tồn tại.');
            return;
        }
        let response;
        if (note.isLocked) {
            const password = await showPasswordModal({ title: 'Nhập mật khẩu để xem ghi chú' });
            response = await fetch(`http://localhost:4000/api/notes/${noteId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': email,
                    'note-password': password
                }
            });
        } else {
            response = await fetch(`http://localhost:4000/api/notes/${noteId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': email
                }
            });
        }
        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Không thể tải ghi chú.');
            return;
        }
        const fetchedNote = await response.json();
        selectedNoteId = noteId;
        const editor = document.getElementById("wysiwyg-example");
        editor.innerHTML = fetchedNote.content || "";
        document.getElementById("note-detail").classList.remove("hidden");
        renderGrid();
        firstInputHandled = editor.innerText.trim().length > 0;
        placeCaretAtEnd(editor);
    } catch (err) {
        console.error('Error selecting note:', err);
        alert('Lỗi khi tải ghi chú. Vui lòng thử lại.');
    }
}

async function createNote() {
    const timestamp = formatTimestamp(new Date());
    const newNote = {
        content: "",
        title: "Ghi chú trống",
        timestamp
    };
    const createdNote = await createNoteOnServer(newNote);
    if (createdNote) {
        notes.push(createdNote);
        selectedNoteId = createdNote._id;
        renderGrid();
        selectNote(selectedNoteId);
    }
    firstInputHandled = false;
    document.getElementById("wysiwyg-example").innerHTML = '';
}

async function createNoteOnServer(note) {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user ? user.email : '';
        const response = await fetch('http://localhost:4000/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-email': email
            },
            body: JSON.stringify(note)
        });
        if (!response.ok) {
            throw new Error('Failed to create note');
        }
        return await response.json();
    } catch (err) {
        throw err;
    }
}

const debouncedAutoSave = debounce(async () => {
    if (!selectedNoteId) return;
    const editor = document.getElementById("wysiwyg-example");
    const content = editor.innerHTML;
    const note = notes.find(n => n._id === selectedNoteId);
    if (!note) return;
    const h1 = editor.querySelector("h1");
    const title = h1 ? h1.textContent.trim() || "Ghi chú trống" : "Ghi chú trống";
    const timestamp = formatTimestamp(new Date());
    const updateData = {
        content,
        title,
        timestamp
    };
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user ? user.email : '';
        let response;
        if (note.isLocked) {
            const password = await showPasswordModal({ title: 'Nhập mật khẩu để lưu ghi chú' });
            response = await fetch(`http://localhost:4000/api/notes/${selectedNoteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': email
                },
                body: JSON.stringify({ ...updateData, password })
            });
        } else {
            response = await fetch(`http://localhost:4000/api/notes/${selectedNoteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': email
                },
                body: JSON.stringify(updateData)
            });
        }
        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Không thể lưu ghi chú.');
            return;
        }
        const updatedNote = await response.json();
        const noteIndex = notes.findIndex(n => n._id === selectedNoteId);
        notes[noteIndex] = {
            _id: updatedNote._id,
            content: updatedNote.content,
            title: updatedNote.title,
            timestamp: updatedNote.timestamp,
            isLocked: updatedNote.isLocked
        };
        renderGrid();
    } catch (err) {
        console.error('Error auto-saving note:', err);
        alert('Lỗi khi lưu ghi chú. Vui lòng thử lại.');
    }
}, 1000);

function autoSaveNote() {
    debouncedAutoSave();
}

function showPasswordModal({ title = "Nhập mật khẩu" } = {}) {
    return new Promise((resolve, reject) => {
        const modal = document.getElementById('password-modal');
        const titleEl = document.getElementById('password-modal-title');
        const input = document.getElementById('password-input');
        const error = document.getElementById('password-error');
        const cancelBtn = document.getElementById('password-cancel-btn');
        const submitBtn = document.getElementById('password-submit-btn');

        titleEl.textContent = title;
        input.value = '';
        error.classList.add('hidden');
        modal.classList.remove('hidden');

        function cleanup() {
            modal.classList.add('hidden');
            cancelBtn.removeEventListener('click', onCancel);
            submitBtn.removeEventListener('click', onSubmit);
        }

        function onCancel() {
            cleanup();
            reject(new Error('User cancelled'));
        }

        function onSubmit() {
            const value = input.value.trim();
            if (!value) {
                error.textContent = "Mật khẩu không được để trống.";
                error.classList.remove('hidden');
                return;
            }
            cleanup();
            resolve(value);
        }

        cancelBtn.addEventListener('click', onCancel);
        submitBtn.addEventListener('click', onSubmit);
    });
}

async function setPassword(noteId, isLocked) {
    try {
        if (!noteId) {
            throw new Error('ID ghi chú không hợp lệ');
        }

        const user = JSON.parse(localStorage.getItem("user") || '{}');
        const email = user.email || '';

        if (!email) {
            alert('Vui lòng đăng nhập để thực hiện thao tác này');
            return;
        }

        let password = null;
        let shouldUpdate = false;

        if (!isLocked) {
            // Ghi chú chưa bị khóa → yêu cầu người dùng nhập mật khẩu mới
            try {
                password = await showPasswordModal({ title: 'Nhập mật khẩu mới cho ghi chú' });
                shouldUpdate = true;
            } catch (err) {
                // Người dùng hủy modal
                return;
            }
        } else {
            // Ghi chú đang bị khóa → hỏi xác nhận để gỡ mật khẩu
            if (confirm("Bạn có chắc muốn xóa mật khẩu ghi chú này?")) {
                shouldUpdate = true;
            } else {
                return;
            }
        }

        if (shouldUpdate) {
            const response = await fetch(`http://localhost:4000/api/notes/${noteId}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': email
                },
                body: JSON.stringify({ password })
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Không thể cập nhật mật khẩu');
            }

            const noteIndex = notes.findIndex(n => n._id === noteId);
            if (noteIndex === -1) {
                throw new Error('Không tìm thấy ghi chú trong danh sách');
            }

            notes[noteIndex].isLocked = responseData.isLocked;
            renderGrid();

            alert(responseData.message || 'Cập nhật mật khẩu thành công');
        }

    } catch (err) {
        console.error('Lỗi khi cập nhật mật khẩu:', err);
        alert(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    }
}

async function deleteNote(noteId) {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user ? user.email : '';
        let password = '';
        const note = notes.find(n => n._id === noteId);
        if (note && note.isLocked) {
            password = prompt('Nhập mật khẩu để xóa ghi chú:');
            if (!password) {
                alert('Mật khẩu là bắt buộc.');
                return;
            }
        }
        const response = await fetch(`http://localhost:4000/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'user-email': email
            },
            body: JSON.stringify({ password })
        });
        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Không thể xóa ghi chú.');
            return;
        }
        const index = notes.findIndex(n => n._id === noteId);
        if (index !== -1) notes.splice(index, 1);
        document.getElementById("delete-modal").classList.add("hidden");
        renderNotes();
        selectedNoteId = null;
        const editor = document.getElementById("wysiwyg-example");
        editor.innerHTML = "";
    } catch (err) {
        console.error('Error deleting note:', err);
        alert('Lỗi khi xóa ghi chú. Vui lòng thử lại.');
    }
}



function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

document.getElementById("wysiwyg-example").addEventListener("input", () => {
    const editor = document.getElementById("wysiwyg-example");
    if (!firstInputHandled && editor.innerText.trim().length > 0) {
        const lines = editor.innerText.split('\n');
        const firstLine = lines[0].trim();
        if (firstLine) {
            const h1 = document.createElement("h1");
            h1.className = "text-2xl font-bold";
            h1.textContent = firstLine;
            editor.innerHTML = "";
            editor.appendChild(h1);
            const p = document.createElement("p");
            editor.appendChild(p);
            placeCaretAtEnd(p);
            firstInputHandled = true;
        }
    }
    autoSaveNote();
});

function applyFormat(command, value = null) {
    document.execCommand(command, false, value);
    autoSaveNote();
}

document.getElementById("toggleBoldButton").addEventListener("click", () => applyFormat("bold"));
document.getElementById("toggleItalicButton").addEventListener("click", () => applyFormat("italic"));
document.getElementById("toggleUnderlineButton").addEventListener("click", () => applyFormat("underline"));
document.getElementById("toggleLinkButton").addEventListener("click", () => {
    const url = prompt("Nhập URL:");
    if (url) applyFormat("createLink", url);
});
document.getElementById("removeLinkButton").addEventListener("click", () => applyFormat("unlink"));
document.getElementById("toggleLeftAlignButton").addEventListener("click", () => applyFormat("justifyLeft"));
document.getElementById("toggleCenterAlignButton").addEventListener("click", () => applyFormat("justifyCenter"));
document.getElementById("toggleRightAlignButton").addEventListener("click", () => applyFormat("justifyRight"));
document.getElementById("toggleListButton").addEventListener("click", () => applyFormat("insertUnorderedList"));
document.getElementById("toggleOrderedListButton").addEventListener("click", () => applyFormat("insertOrderedList"));
document.getElementById("toggleBlockquoteButton").addEventListener("click", () => {
    const selection = window.getSelection();
    if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        if (selectedText) {
            const blockquote = document.createElement("blockquote");
            blockquote.innerText = selectedText;
            range.deleteContents();
            range.insertNode(blockquote);
            autoSaveNote();
        }
    }
});
document.getElementById("toggleHRButton").addEventListener("click", () => applyFormat("insertHorizontalRule"));

document.querySelectorAll("#textSizeDropdown button").forEach(button => {
    button.addEventListener("click", () => {
        const size = button.getAttribute("data-text-size");
        applyFormat("fontSize", size.replace("px", ""));
    });
});

document.querySelectorAll("#textColorDropdown button").forEach(button => {
    button.addEventListener("click", () => {
        const color = button.getAttribute("data-hex-color");
        applyFormat("foreColor", color);
    });
});
document.getElementById("color").addEventListener("input", (e) => {
    applyFormat("foreColor", e.target.value);
});
document.getElementById("reset-color").addEventListener("click", () => {
    applyFormat("foreColor", "#FFFFFF");
});

document.getElementById("addImageButton").addEventListener("click", () => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url) {
        applyFormat("insertImage", url);
    }
});

document.getElementById("wysiwyg-example").addEventListener("input", autoSaveNote);


document.getElementById("create-note-btn").addEventListener("click", createNote);

document.addEventListener("DOMContentLoaded", initNotes);

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "../LoginPage/index.html";
});

