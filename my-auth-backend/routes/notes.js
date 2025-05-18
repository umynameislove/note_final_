const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongoose').Types;

// Note Schema
const noteSchema = new mongoose.Schema({
    content: { type: String, default: '' },
    title: { type: String, default: '' },
    timestamp: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, default: '' },
    isLocked: { type: Boolean, default: false }
});

const Note = mongoose.model('Note', noteSchema);

// Middleware để lấy email từ thông tin người dùng đã xác thực
const getUserEmail = (req) => {
    return req.headers['user-email'] || 'unknown@example.com';
};

// Get all notes for the logged-in user
router.get('/', async (req, res) => {
    try {
        const email = getUserEmail(req);
        const notes = await Note.find({ email }).select('-password');
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get a specific note (requires password in header if locked)
router.get('/:id', async (req, res) => {
    try {
        const email = getUserEmail(req);
        const note = await Note.findOne({ _id: req.params.id, email });
        if (!note) {
            return res.status(404).json({ message: 'Note not found or not authorized' });
        }
        if (note.isLocked) {
            const password = req.headers['note-password'];
            if (!password) {
                return res.status(403).json({ message: 'Password required', isLocked: true });
            }
            const isMatch = await bcrypt.compare(password, note.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect password' });
            }
        }
        res.json({
            _id: note._id,
            content: note.content,
            title: note.title,
            timestamp: note.timestamp,
            isLocked: note.isLocked
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create a new note
router.post('/', async (req, res) => {
    try {
        const { content, title, timestamp } = req.body;
        const email = getUserEmail(req);
        const derivedTitle = title || (content ? content.split('\n')[0].substring(0, 20) + (content.split('\n')[0].length > 20 ? '...' : '') : 'Ghi chú trống');
        const note = new Note({
            content: content || '',
            title: derivedTitle,
            timestamp,
            email
        });
        await note.save();
        res.status(201).json({
            _id: note._id,
            content: note.content,
            title: note.title,
            timestamp: note.timestamp,
            isLocked: note.isLocked
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update a note
router.put('/:id', async (req, res) => {
    try {
        const

 { content, title, timestamp, password } = req.body;
        const email = getUserEmail(req);
        const derivedTitle = title || (content ? content.split('\n')[0].substring(0, 20) + (content.split('\n')[0].length > 20 ? '...' : '') : 'Ghi chú trống');
        const note = await Note.findOne({ _id: req.params.id, email });
        if (!note) {
            return res.status(404).json({ message: 'Note not found or not authorized' });
        }
        if (note.isLocked) {
            if (!password || !(await bcrypt.compare(password, note.password))) {
                return res.status(401).json({ message: 'Incorrect password' });
            }
        }
        const updatedNote = await Note.findOneAndUpdate(
            { _id: req.params.id, email },
            { content, title: derivedTitle, timestamp },
            { new: true }
        );
        res.json({
            _id: updatedNote._id,
            content: updatedNote.content,
            title: updatedNote.title,
            timestamp: updatedNote.timestamp,
            isLocked: updatedNote.isLocked
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID ghi chú không hợp lệ' });
    }

    const { password } = req.body;
    const email = getUserEmail(req);
    if (!email) {
      return res.status(400).json({ message: 'Email người dùng không được cung cấp' });
    }

    const note = await Note.findOne({ _id: req.params.id, email });
    if (!note) {
      return res.status(404).json({ message: 'Ghi chú không tồn tại hoặc bạn không có quyền truy cập' });
    }

    if (note.isLocked) {
      if (!password) {
        return res.status(400).json({ message: 'Mật khẩu là bắt buộc để xóa ghi chú đã khóa' });
      }
      if (typeof password !== 'string') {
        return res.status(400).json({ message: 'Mật khẩu phải là chuỗi' });
      }
      if (!(await bcrypt.compare(password, note.password))) {
        return res.status(401).json({ message: 'Mật khẩu không chính xác' });
      }
    }

    await Note.findOneAndDelete({ _id: req.params.id, email });
    res.json({ message: 'Xóa ghi chú thành công' });
  } catch (err) {
    console.error('Server error:', err.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa ghi chú', error: err.message });
  }
});

// Set or remove password for a note
router.put('/:id/password', async (req, res) => {
    try {
        const { password } = req.body;
        const email = getUserEmail(req); // Giả sử hàm này trả về email đã xác thực

        // Kiểm tra email hợp lệ
        if (!email) {
            return res.status(401).json({ message: 'Yêu cầu xác thực người dùng' });
        }

        // Tìm ghi chú
        const note = await Note.findOne({ _id: req.params.id, email });
        if (!note) {
            return res.status(404).json({ message: 'Ghi chú không tồn tại hoặc không được phép' });
        }

        // Xử lý mật khẩu
        if (password && typeof password === 'string' && password.length > 0) {
            // Đặt mật khẩu mới
            const hashedPassword = await bcrypt.hash(password, 10);
            note.password = hashedPassword;
            note.isLocked = true;
        } else if (password === null) {
            // Xóa mật khẩu (chỉ khi client gửi password: null rõ ràng)
            note.password = null;
            note.isLocked = false;
        } else {
            // Trường hợp không hợp lệ (password là chuỗi rỗng hoặc không xác định)
            return res.status(400).json({ message: 'Mật khẩu không hợp lệ' });
        }

        // Lưu thay đổi
        await note.save();

        // Trả về phản hồi
        res.json({
            _id: note._id,
            isLocked: note.isLocked,
            message: note.isLocked ? 'Đặt mật khẩu thành công' : 'Xóa mật khẩu thành công'
        });
    } catch (err) {
        console.error('Lỗi khi cập nhật mật khẩu:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

module.exports = router;