import { useState } from "react";

const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      onSuccess();
    } catch {
      setError("Login failed");
    }
  };

  return (
    <div className="tab-header" style={{ textAlign: "center" }}>
      <h2>Authenticate</h2>
  
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <input
          className="form-input"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
  
      <button className="btn-secondary" onClick={handleLogin}>
        Login
      </button>
  
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );  
};

export default Login;