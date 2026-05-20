import { Layout } from '../components/Layout';

function StaticPage({ title, subtitle, sections }) {
  return (
    <Layout>
      <div style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>{title}</h1>
          {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>{subtitle}</p>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map((s, i) => (
            <details key={i} style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              <summary style={{
                padding: '16px 20px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                listStyle: 'none',
                userSelect: 'none',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--accent-soft)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</span>
                  {s.title}
                </span>
                <ChevronIcon/>
              </summary>
              <div style={{
                padding: '14px 20px 18px 60px',
                fontSize: 14,
                lineHeight: 1.75,
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border)',
              }}>
                {s.content}
              </div>
            </details>
          ))}
        </div>
      </div>

      <style>{`
        details[open] summary { background: var(--bg-soft); }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary .chevron { transform: rotate(180deg); }
        .chevron { transition: transform .2s; }
      `}</style>
    </Layout>
  );
}

function ChevronIcon() {
  return (
    <svg className="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

export function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      subtitle="Short version: we don't do anything shady with your data."
      sections={[
        {
          title: 'What we collect',
          content: 'When you sign up we ask for your name, email, and optionally a phone number. When you post a listing we store the title, description, photos, and city. Chats between users are stored so you can find them again.',
        },
        {
          title: 'What we do with it',
          content: 'We use your info to run the platform — showing your listings, letting buyers reach you, and sending notifications when someone messages you. That\'s it. No selling, no ad targeting.',
        },
        {
          title: 'Where it\'s stored',
          content: 'Everything lives on Supabase — a secure cloud database. Photos go into cloud storage. We don\'t have access to your password (it\'s hashed before we even see it).',
        },
        {
          title: 'Cookies & local storage',
          content: 'We save your city, currency preference, and favorites in your browser\'s local storage. No tracking pixels, no analytics cookies, no "we followed you to another site" stuff.',
        },
        {
          title: 'Deleting your data',
          content: 'You can delete your listings anytime. To delete your full account and all data, go to Settings. If you run into any issues, contact us and we\'ll sort it out.',
        },
        {
          title: 'Questions?',
          content: 'If something here is unclear or you\'re concerned about your data, check the Help page or reach out. We\'re real people and we\'ll actually reply.',
        },
      ]}
    />
  );
}

const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    num: '1',
    title: 'Acceptance of Terms',
    content: (
      <>
        <p>By accessing or using the ZXC KYS platform ("Platform", "Service", "we", "us", or "our"), you confirm that you have read, understood, and agree to be bound by these Terms of Use ("Terms"). If you do not agree with any part of these Terms, you must not access or use the Platform.</p>
        <p>These Terms apply to all visitors, users, buyers, sellers, and anyone else who accesses or uses the Service. By creating an account, posting a listing, or simply browsing the Platform, you enter into a legally binding agreement with us.</p>
        <p>You must be at least 16 years of age to use this Service. If you are under 18, you confirm that a parent or legal guardian has reviewed and agreed to these Terms on your behalf.</p>
      </>
    ),
  },
  {
    id: 'account',
    num: '2',
    title: 'Account Registration & Security',
    content: (
      <>
        <p>To access certain features of the Platform, you must register for an account. When creating an account, you agree to:</p>
        <ul>
          <li>Provide accurate, current, and complete information (name, email, and optional phone number)</li>
          <li>Maintain and promptly update your account information to keep it accurate</li>
          <li>Keep your password confidential and not share it with any third party</li>
          <li>Be responsible for all activities that occur under your account</li>
          <li>Notify us immediately at <a href="mailto:support@zxckys.com">support@zxckys.com</a> if you suspect any unauthorized access</li>
        </ul>
        <p>You may only create one account per person. Multiple accounts for the same individual are not permitted. We reserve the right to verify your identity and suspend accounts we believe to be duplicates.</p>
        <p>We are not liable for any loss or damage arising from your failure to safeguard your account credentials. You are solely responsible for maintaining the security of your login information.</p>
      </>
    ),
  },
  {
    id: 'permitted-use',
    num: '3',
    title: 'Permitted Use of the Platform',
    content: (
      <>
        <p>The Platform is provided as a marketplace for individuals to buy and sell personal property. You may use the Platform only for its intended purpose and in compliance with all applicable laws and regulations.</p>
        <p>You agree to use the Platform in a manner that is:</p>
        <ul>
          <li>Lawful and compliant with all local, national, and international laws</li>
          <li>Honest, transparent, and fair toward other users</li>
          <li>Respectful of the rights of other users and third parties</li>
          <li>Free from deceptive, misleading, or fraudulent intent</li>
        </ul>
        <p>The Platform is intended for personal transactions only. Commercial use, mass listing by businesses, or automated bulk posting requires explicit written permission from us.</p>
      </>
    ),
  },
  {
    id: 'prohibited',
    num: '4',
    title: 'Prohibited Content & Conduct',
    content: (
      <>
        <p>You agree that you will NOT post, transmit, or engage in any of the following on the Platform:</p>
        <ul>
          <li><strong>Illegal items:</strong> weapons, controlled substances, stolen goods, counterfeit products, or any item whose sale is prohibited by applicable law</li>
          <li><strong>Adult content:</strong> sexually explicit material, adult services, or content inappropriate for minors</li>
          <li><strong>Fraudulent listings:</strong> listings for items you do not own, do not intend to sell, or that misrepresent the item's condition, price, or description</li>
          <li><strong>Harassment:</strong> messages, content, or actions that threaten, intimidate, harass, or harm other users</li>
          <li><strong>Spam:</strong> repeated, unsolicited, or automated messages, listings, or communications</li>
          <li><strong>Scraping & automation:</strong> using bots, scrapers, or automated tools to access, extract, or interact with the Platform without permission</li>
          <li><strong>Impersonation:</strong> pretending to be another person, business, or entity</li>
          <li><strong>Malware:</strong> uploading or transmitting viruses, malicious code, or any software designed to harm users or the Platform</li>
        </ul>
        <p>Violation of these rules may result in immediate account suspension or permanent ban, removal of all listings, and potential legal action where applicable.</p>
      </>
    ),
  },
  {
    id: 'listings',
    num: '5',
    title: 'Listings & Content Responsibility',
    content: (
      <>
        <p>You are solely responsible for the content of any listing, message, photo, or other material you post on the Platform. By submitting content, you represent and warrant that:</p>
        <ul>
          <li>You own or have the right to sell the item described</li>
          <li>The listing accurately describes the item's condition, contents, and any known defects</li>
          <li>All photos are authentic and represent the actual item being sold</li>
          <li>The listing does not infringe on any third-party intellectual property, trademark, or copyright</li>
          <li>The content does not violate these Terms or any applicable law</li>
        </ul>
        <p>By posting content, you grant us a non-exclusive, worldwide, royalty-free license to display, store, reproduce, and distribute that content solely for the purpose of operating and improving the Platform.</p>
        <p>We reserve the right to remove any listing or content at our sole discretion, without prior notice, if we determine it violates these Terms or our community guidelines. Repeated violations may result in permanent account termination.</p>
      </>
    ),
  },
  {
    id: 'transactions',
    num: '6',
    title: 'Transactions & Payments',
    content: (
      <>
        <p>ZXC KYS is a classifieds marketplace — we connect buyers and sellers but are <strong>not a party to any transaction</strong>. We do not process payments, hold funds in escrow, or facilitate shipping on behalf of users.</p>
        <p>All sales and agreements are made directly between buyers and sellers. As such:</p>
        <ul>
          <li>We are not responsible for the quality, safety, legality, or delivery of any item</li>
          <li>We do not guarantee the accuracy of any listing</li>
          <li>We are not liable for any dispute, loss, or damage arising from a transaction</li>
          <li>We do not offer buyer or seller protection programs</li>
        </ul>
        <p>We strongly recommend meeting in safe, public locations for in-person exchanges, inspecting items before payment, and using common sense. If a deal seems too good to be true, it probably is.</p>
        <p>Any optional paid features (such as listing boosts or promotions) are billed directly and are non-refundable once used. Pricing for paid features is displayed clearly before purchase.</p>
      </>
    ),
  },
  {
    id: 'privacy',
    num: '7',
    title: 'Privacy & Personal Data',
    content: (
      <>
        <p>Your privacy matters to us. When you register, we collect your name, email address, and optionally a phone number. This information is used exclusively to operate the Platform — enabling buyers to contact you, sending notifications, and managing your account.</p>
        <p>We do not sell, rent, or share your personal data with third parties for marketing purposes. Data is stored securely on Supabase infrastructure. Your password is hashed and never stored in plain text.</p>
        <p>We use browser local storage (not tracking cookies) to remember your preferences such as city, currency, and saved favorites. We do not use advertising trackers or analytics that follow you across other websites.</p>
        <p>You may request deletion of your account and all associated data at any time via Settings or by contacting us at <a href="mailto:support@zxckys.com">support@zxckys.com</a>. Certain data may be retained for a limited period as required by law or for legitimate business purposes (e.g., fraud prevention).</p>
        <p>For full details, please review our <a href="/privacy">Privacy Policy</a>.</p>
      </>
    ),
  },
  {
    id: 'ip',
    num: '8',
    title: 'Intellectual Property',
    content: (
      <>
        <p>All elements of the Platform — including but not limited to the design, layout, logo, trademarks, source code, icons, and proprietary content — are owned by or licensed to ZXC KYS and are protected by applicable intellectual property laws.</p>
        <p>You may not:</p>
        <ul>
          <li>Copy, reproduce, or redistribute any part of the Platform's design or code</li>
          <li>Use our trademarks, logo, or brand name without prior written consent</li>
          <li>Create derivative works based on our Platform without permission</li>
          <li>Reverse-engineer, decompile, or attempt to extract the source code</li>
        </ul>
        <p>Content you post (listings, photos, descriptions) remains your property. We claim no ownership over user-generated content beyond the license described in Section 5.</p>
      </>
    ),
  },
  {
    id: 'moderation',
    num: '9',
    title: 'Moderation & Enforcement',
    content: (
      <>
        <p>We are committed to maintaining a safe and trustworthy marketplace. Our moderation team reviews reported content and may take the following actions:</p>
        <ul>
          <li>Remove listings or content that violate these Terms</li>
          <li>Issue warnings to users who breach the rules</li>
          <li>Temporarily suspend accounts pending investigation</li>
          <li>Permanently ban users who repeatedly or severely violate these Terms</li>
          <li>Report illegal activity to relevant authorities</li>
        </ul>
        <p>Any user can report a listing using the "Report" button on the listing page. Reports are reviewed by our team, typically within 24 hours. We do not reveal the identity of users who submit reports.</p>
        <p>Moderation decisions are made at our sole discretion. You may appeal a decision by contacting <a href="mailto:support@zxckys.com">support@zxckys.com</a> with a clear explanation of your case.</p>
      </>
    ),
  },
  {
    id: 'disclaimer',
    num: '10',
    title: 'Disclaimers & Limitation of Liability',
    content: (
      <>
        <p>The Platform is provided on an <strong>"as is" and "as available"</strong> basis, without warranties of any kind — express, implied, or statutory. We make no guarantees regarding:</p>
        <ul>
          <li>The accuracy, completeness, or reliability of any listing or user-submitted content</li>
          <li>Uninterrupted, error-free, or secure access to the Platform</li>
          <li>The outcome of any transaction between users</li>
          <li>The conduct, identity, or trustworthiness of any user</li>
        </ul>
        <p>To the fullest extent permitted by applicable law, ZXC KYS and its team shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:</p>
        <ul>
          <li>Your use of or inability to use the Platform</li>
          <li>Any transaction carried out through the Platform</li>
          <li>Unauthorized access to your account or data</li>
          <li>Any content posted by other users</li>
        </ul>
        <p>In no event shall our total liability to you exceed the amount you have paid us (if any) in the 12 months preceding the event giving rise to the claim.</p>
      </>
    ),
  },
  {
    id: 'termination',
    num: '11',
    title: 'Termination',
    content: (
      <>
        <p>We may suspend or terminate your account and access to the Platform at any time, with or without notice, if we reasonably believe you have violated these Terms or engaged in conduct that is harmful to the Platform, other users, or third parties.</p>
        <p>Upon termination:</p>
        <ul>
          <li>Your right to use the Platform ceases immediately</li>
          <li>Your listings and public profile will be removed</li>
          <li>You remain bound by any provisions of these Terms that by their nature should survive termination (including Sections 7, 8, 10)</li>
        </ul>
        <p>You may delete your account at any time by going to Settings → Delete Account, or by contacting us at <a href="mailto:support@zxckys.com">support@zxckys.com</a>. We will process your request within 30 days.</p>
      </>
    ),
  },
  {
    id: 'changes',
    num: '12',
    title: 'Changes to These Terms',
    content: (
      <>
        <p>We may revise these Terms from time to time to reflect changes in the law, our services, or our business practices. When we make material changes, we will:</p>
        <ul>
          <li>Update the "Last updated" date at the top of this page</li>
          <li>Send a notification to your registered email address</li>
          <li>Display a prominent notice on the Platform for at least 14 days</li>
        </ul>
        <p>Your continued use of the Platform after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree with the updated Terms, you must stop using the Platform and may delete your account.</p>
        <p>We encourage you to review these Terms periodically to stay informed of your rights and obligations.</p>
      </>
    ),
  },
  {
    id: 'contact',
    num: '13',
    title: 'Contact & Governing Law',
    content: (
      <>
        <p>If you have any questions, concerns, or feedback about these Terms or the Platform, please do not hesitate to contact us:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:support@zxckys.com">support@zxckys.com</a></li>
          <li><strong>Response time:</strong> We aim to respond to all inquiries within 2 business days</li>
        </ul>
        <p>These Terms are governed by and construed in accordance with applicable law. Any disputes arising from these Terms or your use of the Platform shall be resolved through good-faith negotiation. If a dispute cannot be resolved amicably, it shall be submitted to binding arbitration or the jurisdiction of the competent courts.</p>
        <p>If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.</p>
      </>
    ),
  },
];

export function TermsPage() {
  return (
    <Layout>
      <div className="tos-page">
        <div className="tos-page-hero">
          <h1 className="tos-page-title">Terms of Use</h1>
          <p className="tos-page-sub">Please read these terms carefully before using ZXC KYS. By accessing our platform, you agree to be bound by the following terms and conditions.</p>
          <div className="tos-page-meta">
            <span>Effective: <strong>May 20, 2026</strong></span>
            <span className="tos-page-dot">·</span>
            <span>Last updated: <strong>May 20, 2026</strong></span>
            <span className="tos-page-dot">·</span>
            <a href="mailto:support@zxckys.com">Questions? Contact us</a>
          </div>
        </div>

        <main className="tos-page-content">
            {TERMS_SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id} className="tos-section">
                <div className="tos-section-header">
                  <span className="tos-section-num">{s.num}</span>
                  <h2 className="tos-section-title">{s.title}</h2>
                </div>
                <div className="tos-section-body">{s.content}</div>
                {i < TERMS_SECTIONS.length - 1 && <div className="tos-section-divider" />}
              </section>
            ))}

        </main>
      </div>

      <style>{`
        .tos-page {
          max-width: 780px;
          margin: 0;
          padding: 0 0 80px;
        }
        .tos-page-hero {
          padding: 0 0 20px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 32px;
        }
        .tos-page-title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text);
          margin: 0 0 12px;
          line-height: 1.1;
        }
        .tos-page-sub {
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 620px;
          margin: 0 0 16px;
        }
        .tos-page-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-faint);
          flex-wrap: wrap;
        }
        .tos-page-meta strong { color: var(--text-muted); font-weight: 600; }
        .tos-page-meta a { color: #2563eb; font-weight: 500; }
        .tos-page-meta a:hover { text-decoration: underline; }
        .tos-page-dot { color: var(--border-strong); }

        /* Sections */
        .tos-section { padding: 0 0 4px; }
        .tos-section-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .tos-section-num {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tos-section-title {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text);
          margin: 0;
        }
        .tos-section-body {
          padding-left: 48px;
          font-size: 14.5px;
          line-height: 1.78;
          color: var(--text-muted);
        }
        .tos-section-body p { margin-bottom: 12px; }
        .tos-section-body p:last-child { margin-bottom: 0; }
        .tos-section-body ul {
          margin: 8px 0 12px 18px;
          padding: 0;
        }
        .tos-section-body ul li { margin-bottom: 6px; }
        .tos-section-body a { color: #2563eb; text-decoration: none; font-weight: 500; }
        .tos-section-body a:hover { text-decoration: underline; }
        .tos-section-body strong { color: var(--text); font-weight: 600; }
        .tos-section-divider {
          height: 1px;
          background: var(--border);
          margin: 36px 0;
        }

        .tos-page-footer-note {
          display: inline-flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 48px;
          padding: 14px 16px;
          background: var(--bg-soft);
          border-radius: 10px;
          border: 1px solid var(--border);
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .tos-page-footer-note svg { flex-shrink: 0; margin-top: 1px; color: var(--text-faint); }
        .tos-page-footer-note a { color: #2563eb; font-weight: 500; }
        .tos-page-footer-note a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .tos-page-hero { padding: 20px 0 18px; }
          .tos-page-title { font-size: 26px; }
          .tos-page-sub { font-size: 14px; }
          .tos-section-body { padding-left: 0; }
          .tos-section-title { font-size: 17px; }
        }
      `}</style>
    </Layout>
  );
}

export function HelpPage() {
  return (
    <StaticPage
      title="Help Center"
      subtitle="Stuck on something? You're probably not the first."
      sections={[
        {
          title: 'How do I post a listing?',
          content: 'Hit "Post Ad" in the top right (or the + button if you\'re on mobile). Add a title, pick a category, write a description, set a price, and drop your city. Throw in some photos — listings with photos get way more views. Hit "Post Listing" and you\'re live.',
        },
        {
          title: 'How do I message a seller?',
          content: 'Open the listing and click "Message Seller". It opens a private chat — no phone number needed. If the seller chose to show their number, you\'ll also see a call button.',
        },
        {
          title: 'How do reviews work?',
          content: 'Once a deal is marked as complete — the buyer confirms they received the item — they can leave a star rating and a comment. Reviews show up on the seller\'s profile and affect their overall rating.',
        },
        {
          title: 'How do I report something sketchy?',
          content: 'On any listing, scroll down to the action buttons and tap "Report listing". Pick a reason, submit, and the listing disappears from your feed while our team looks into it.',
        },
        {
          title: 'What\'s the Boost feature?',
          content: 'Boost puts your listing at the top of search results and category pages so more people see it. You can boost for 7 days ($2.99) or 30 days ($7.99). Open your listing and hit "Boost to top" to get started.',
        },
        {
          title: 'How do I edit or remove a listing?',
          content: 'Open your listing — you\'ll see Edit and Delete buttons right there. Editing lets you change anything. Deleting is permanent, so make sure you mean it.',
        },
        {
          title: 'I can\'t log in',
          content: 'Double-check you\'re using the right email. If you forgot your password, hit "Forgot password?" on the login page and follow the reset link. Check spam if the email doesn\'t show up.',
        },
        {
          title: 'Something is broken',
          content: 'Try refreshing first — fixes 80% of issues. If that doesn\'t help, clear your browser cache or try a different browser. Still broken? Contact us and we\'ll take a look.',
        },
      ]}
    />
  );
}
