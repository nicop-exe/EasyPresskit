import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';

export function UserMenu() {
    const { currentUser, loginWithGoogle, logout } = useAuth();
    const [imgError, setImgError] = useState(false);

    const handleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Failed to login", error);
            alert("No se pudo iniciar sesión: " + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    if (!currentUser) {
        return (
            <button
                onClick={handleLogin}
                className="neon-button"
                style={{
                    '--neon-color': '#00f3ff',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.875rem', padding: '0.5rem 1rem'
                }}
            >
                <User size={16} />
                Sign In
            </button>
        );
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
            padding: '0.375rem 0.75rem', borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {currentUser.photoURL && !imgError ? (
                <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    style={{
                        width: '2rem', height: '2rem', borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.2)', objectFit: 'cover'
                    }}
                    onError={() => setImgError(true)}
                />
            ) : (
                <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <User size={16} color="rgba(255,255,255,0.7)" />
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                    {currentUser.displayName}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.email}
                </span>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    marginLeft: '0.5rem', width: '2rem', height: '2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)', border: 'none', background: 'transparent', padding: 0
                }}
                title="Sign Out"
            >
                <LogOut size={16} />
            </button>
        </div>
    );
}
