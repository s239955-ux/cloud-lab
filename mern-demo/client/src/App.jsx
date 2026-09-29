import { useEffect, useState } from 'react';
import './App.css';

const emptyForm = {
  studentId: '',
  name: '',
  email: '',
};

const API_URL = '/api/students';

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchStudents = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setMessage('Không thể kết nối tới Backend. Hãy kiểm tra server Node.js.');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      studentId: form.studentId.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
    };

    const url = editingId
      ? `${API_URL}/${editingId}`
      : API_URL;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      setMessage(editingId ? 'Cập nhật sinh viên thành công.' : 'Thêm sinh viên thành công.');
      setForm(emptyForm);
      setEditingId(null);
      fetchStudents();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
    });
    setMessage('Đang chỉnh sửa sinh viên.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sinh viên này?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Xóa thất bại');
      }

      setMessage('Xóa sinh viên thành công.');
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      fetchStudents();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Cloud Lab</p>
          <h1>Quản lý sinh viên - Phiên bản 2.0</h1>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel">
          <h2>{editingId ? 'Cập nhật sinh viên' : 'Thêm sinh viên mới'}</h2>

          <form onSubmit={handleSubmit} className="student-form">
            <label>
              MSSV
              <input
                type="text"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                placeholder="SV001"
                required
              />
            </label>

            <label>
              Họ tên
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@email.com"
                required
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setMessage('Đã hủy cập nhật.');
                  }}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>

          {message && <p className="message">{message}</p>}
        </section>

        <section className="panel">
          <h2>Danh sách sinh viên</h2>

          {students.length === 0 ? (
            <p className="empty-state">Chưa có sinh viên nào trong cơ sở dữ liệu.</p>
          ) : (
            <ul className="student-list">
              {students.map((student) => (
                <li key={student._id} className="student-item">
                  <div>
                    <strong>{student.studentId}</strong>
                    <p>{student.name}</p>
                    <span>{student.email}</span>
                  </div>
                  <div className="student-actions">
                    <button type="button" className="secondary-btn" onClick={() => handleEdit(student)}>
                      Sửa
                    </button>
                    <button type="button" className="danger-btn" onClick={() => handleDelete(student._id)}>
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
