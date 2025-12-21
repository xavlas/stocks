import React, { useState } from 'react';

const CREDENTIALS = {
    username: 'admin',
    password: 'stock2025'
};

interface LoginProps {
    onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
            sessionStorage.setItem('authenticated', 'true');
            onLogin();
        } else {
            setError('Invalid username or password');
            setPassword('');
        }
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0px 20px 60px rgba(0,0,0,0.3)',
                width: '300px',
                maxWidth: '90%'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚡</div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                        STOCK AI
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px' }}>
                        Sign in to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid #E0E5F2',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            autoFocus
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid #E0E5F2',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#FFEDED',
                            color: '#E53935',
                            borderRadius: '10px',
                            fontSize: '14px',
                            marginBottom: '20px',
                            border: '1px solid #FFCDD2'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: 'var(--primary-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Sign In
                    </button>
                </form>

                <div style={{
                    marginTop: '30px',
                    padding: '15px',
                    background: '#F4F7FE',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                }}>
                    <strong>Demo Credentials:</strong><br />
                    Username: admin | Password: stock2025
                </div>
            </div>
        </div>
    );
};
