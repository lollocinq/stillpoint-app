"use client";

import { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";
import PresenceChat from "../../components/PresenceChat";
import { supabase } from "../../lib/supabaseClient";

export default function KrishnamurtiGuide() {
  const [hasPaid, setHasPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkPaymentStatus() {
      try {
        setCheckingPayment(true);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
          if (active) {
            setHasPaid(false);
            setCheckingPayment(false);
          }
          return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser(token);

        if (userError || !userData?.user?.id) {
          throw userError || new Error("No authenticated user found.");
        }

        const { data: payments, error: paymentsError } = await supabase
          .from("payments")
          .select("user_id")
          .eq("user_id", userData.user.id)
          .eq("paid", true)
          .limit(1);

        if (paymentsError) {
          throw paymentsError;
        }

        if (active) {
          setHasPaid((payments ?? []).length > 0);
        }
      } catch (error) {
        console.error("Failed to check payment status:", error);
        if (active) {
          setHasPaid(false);
        }
      } finally {
        if (active) {
          setCheckingPayment(false);
        }
      }
    }

    checkPaymentStatus();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setHasPaid(false);
        setCheckingPayment(false);
        return;
      }

      checkPaymentStatus();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleUnlock() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      return;
    }

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="theme-krishnamurti">
      <section className="guide-header">
        <p className="eyebrow">In the spirit of Jiddu Krishnamurti&rsquo;s teachings</p>
        <h1>Krishnamurti Guide</h1>
        <p className="subtitle">
          Question the question itself. Bring what troubles your mind and look at it directly.
        </p>
      </section>

      <AuthGate>
        {checkingPayment ? (
          <p className="access-note">Checking your payment status&hellip;</p>
        ) : hasPaid ? (
          <>
            <p className="access-note">Your access is unlocked. You can continue with the guide.</p>
            <PresenceChat />
          </>
        ) : (
          <>
            <p className="access-note">
              You&rsquo;re registered. This guide also requires a one-time &euro;1 payment to
              unlock.
            </p>
            <button className="btn" type="button" onClick={handleUnlock}>
              Pay &euro;1 to unlock
            </button>
            <div className="chat-mock">
              <div className="chat-bubble">
                &ldquo;Why do you seek an answer from outside yourself? Can you look at the problem
                without the conditioning of past experience, and see it freshly, as if for the
                first time?&rdquo;
              </div>
              <div className="chat-input-mock">
                <input
                  type="text"
                  placeholder="Payment required to unlock chat"
                  disabled
                />
                <button disabled>Send</button>
              </div>
            </div>
          </>
        )}
      </AuthGate>

      <footer>
        Placeholder content &middot; payment and chat functionality arrive in later build steps
      </footer>
    </div>
  );
}
