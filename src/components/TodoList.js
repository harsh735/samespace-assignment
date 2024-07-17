import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Todolist.css';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState({ title: '', description: '', status: 'pending', user_id: 'user123' });
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 5, totalPages: 1 });
    const [filter, setFilter] = useState({ status: '' });

    useEffect(() => {
        fetchTodos();
    }, [pagination.page, filter]);

    const fetchTodos = async () => {
        try {
            const response = await axios.get(`/api/tasks?user_id=user123&status=${filter.status}&page=${pagination.page}&limit=${pagination.limit}`);
            setTodos(response.data);
            console.log("API response", response);
            const totalTodos = parseInt(response.headers['x-total-count']);
            const totalPages = Math.ceil(totalTodos / pagination.limit);
            setPagination(prevPagination => ({
                ...prevPagination,
                totalPages,
            }));
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    };

    const handleChange = (e) => {
        setNewTodo({ ...newTodo, [e.target.name]: e.target.value });
    };

    const handleFilterChange = (e) => {
        setFilter({ status: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!newTodo.title.trim() || !newTodo.description.trim()) {
                setError('Title and description are required.');
                return;
            }

            await axios.post('http://localhost:8080/tasks', newTodo);
            setNewTodo({ title: '', description: '', status: 'pending', user_id: 'user123' });
            fetchTodos();
        } catch (error) {
            console.error('Error adding new todo:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/tasks/${id}?user_id=user123`);
            fetchTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const handleUpdate = async (id, updatedTodo) => {
        try {
            await axios.put(`http://localhost:8080/tasks/${id}`, updatedTodo);
            fetchTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination({ ...pagination, page: newPage });
    };

    return (
        <div className="container">
            <div className="todo-form">
                <h1>Todo List</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="title"
                            value={newTodo.title}
                            onChange={handleChange}
                            placeholder="Add a todo..."
                            className="input-field"
                        />
                        <input
                            type="text"
                            name="description"
                            value={newTodo.description}
                            onChange={handleChange}
                            placeholder="Enter a description.."
                            className="input-field"
                        />
                        <button type="submit" className="add-button">Add Todo!</button>
                    </div>
                </form>
                <div className="button-group">
                    <select className="filter-select" onChange={handleFilterChange} value={filter.status}>
                        <option value="">Filter</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>
            <div className="todo-list">
                <table>
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {todos && todos.length > 0 ? (
                            todos.map((todo) => (
                                <tr key={todo.id}>
                                    <td>{todo.title}</td>
                                    <td>{todo.description}</td>
                                    <td>{todo.status}</td>
                                    <td className="action-buttons">
                                        <button className="delete-button" onClick={() => handleDelete(todo.id)}>Delete</button>
                                        <button className="complete-button" onClick={() => handleUpdate(todo.id, { ...todo, status: 'completed' })}>Complete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No tasks found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="pagination">
                    <button disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>
                        Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TodoList;
