"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./login.module.css";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (response?.error) {
        setError("Email hoặc mật khẩu không chính xác.");
      } else {
        // Redirection on success
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={`${styles.title} serif-title`}>Đăng Nhập</h1>
          <p className={styles.subtitle}>Chào mừng bạn quay lại với FlowerDang</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Địa chỉ Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="example@flowerdang.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary styles.submitBtn"
            disabled={isSubmitting}
            style={{ width: "100%" }}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng Nhập 🔑"}
          </button>
        </form>

        {/* Demo Credentials for Evaluation/Test convenience */}
        <div className={styles.demoInfo}>
          <span className={styles.demoTitle}>Tài khoản thử nghiệm (Demo Accounts):</span>
          <p>
            <strong>👤 Khách hàng:</strong> customer@flowerdang.com <br />
            <strong>🔑 Mật khẩu:</strong> customerpassword
          </p>
          <div style={{ height: "1px", backgroundColor: "var(--card-border)", margin: "4px 0" }} />
          <p>
            <strong>🛡️ Admin Shop:</strong> admin@flowerdang.com <br />
            <strong>🔑 Mật khẩu:</strong> adminpassword
          </p>
        </div>
      </div>
    </div>
  );
}
