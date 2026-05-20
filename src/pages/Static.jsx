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
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
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
        <p>Using [YOUR_PLATFORM_NAME] means you agree to these Terms. That includes browsing, posting a listing, messaging someone — all of it. If anything here doesn't work for you, please don't use the platform.</p>
        <p>These Terms apply to everyone: visitors, buyers, sellers, and anyone else who shows up. We've kept the language as plain as we can — if something isn't clear, just reach out and ask.</p>
        <p>You need to be at least 16 to use this platform. If you're under 18, a parent or guardian should review these Terms with you.</p>
      </>
    ),
  },
  {
    id: 'account',
    num: '2',
    title: 'Account Registration & Security',
    content: (
      <>
        <p>Some features require an account. When you sign up, you agree to:</p>
        <ul>
          <li>Give us accurate info — your name, email, and optionally a phone number</li>
          <li>Keep that info up to date if anything changes</li>
          <li>Keep your password to yourself</li>
          <li>Take responsibility for everything that happens under your account</li>
          <li>Let us know at <a href="mailto:support@[YOUR_DOMAIN]">support@[YOUR_DOMAIN]</a> if you think someone got into your account without permission</li>
        </ul>
        <p>One account per person — that's it. If we spot duplicates, we'll suspend the extras. If your account gets compromised because your password leaked, that's on you — keep it safe.</p>
      </>
    ),
  },
  {
    id: 'permitted-use',
    num: '3',
    title: 'Permitted Use of the Platform',
    content: (
      <>
        <p>This is a platform for regular people to buy and sell things. Use it for that. Don't try to repurpose it for something else.</p>
        <p>Whatever you do here, keep it:</p>
        <ul>
          <li>Legal — don't break local or national laws</li>
          <li>Honest — no misleading listings, fake prices, or shady tactics</li>
          <li>Respectful — treat other users the way you'd want to be treated</li>
        </ul>
        <p>This is a personal marketplace. If you're a business that wants to mass-post listings or run automated tools, talk to us first — otherwise we'll consider it a violation.</p>
      </>
    ),
  },
  {
    id: 'prohibited',
    num: '4',
    title: 'Prohibited Content & Conduct',
    content: (
      <>
        <p>Don't post, send, or do any of the following:</p>
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
        <p>Break these rules and your account gets suspended or banned, your listings get removed, and if something is serious enough — we'll involve the authorities.</p>
      </>
    ),
  },
  {
    id: 'listings',
    num: '5',
    title: 'Listings & Content Responsibility',
    content: (
      <>
        <p>Whatever you post here — listings, photos, messages — is your responsibility. When you submit something, you're saying:</p>
        <ul>
          <li>You own or have the right to sell the item described</li>
          <li>The listing accurately describes the item's condition, contents, and any known defects</li>
          <li>All photos are authentic and represent the actual item being sold</li>
          <li>The listing does not infringe on any third-party intellectual property, trademark, or copyright</li>
          <li>The content does not violate these Terms or any applicable law</li>
        </ul>
        <p>By posting, you give us permission to display and store your content — only for running the platform. We're not taking ownership of anything you post.</p>
        <p>We can remove a listing at any time if it breaks these Terms, usually without warning. Repeat offenders get their accounts closed.</p>
      </>
    ),
  },
  {
    id: 'transactions',
    num: '6',
    title: 'Transactions & Payments',
    content: (
      <>
        <p>[YOUR_PLATFORM_NAME] is a classifieds platform — we bring buyers and sellers together, but we're <strong>not part of the deal itself</strong>. We don't handle payments, hold money, or arrange shipping.</p>
        <p>Everything happens directly between users, which means:</p>
        <ul>
          <li>We can't vouch for item quality, condition, or whether it actually ships</li>
          <li>We don't guarantee any listing is accurate</li>
          <li>We're not on the hook for disputes, losses, or anything that goes wrong in a transaction</li>
          <li>There's no buyer or seller protection — be careful out there</li>
        </ul>
        <p>Use common sense: meet in public places, inspect items before you pay, and trust your gut. If an offer feels off, it probably is.</p>
        <p>Paid features like listing boosts are charged upfront and non-refundable once used. You'll see exactly what you're paying before you confirm.</p>
      </>
    ),
  },
  {
    id: 'privacy',
    num: '7',
    title: 'Privacy & Personal Data',
    content: (
      <>
        <p>We collect your name, email, and optionally a phone number when you register. That's it. We use it to run the platform — letting buyers reach you, sending notifications, keeping your account working.</p>
        <p>We don't sell your data. We don't rent it. We don't hand it to advertisers. Your password is hashed before it's stored — we never see it in plain text.</p>
        <p>We use browser local storage (not tracking cookies) to remember things like your city, currency, and favorites. There are no analytics pixels following you around the web.</p>
        <p>Want your data deleted? Go to Settings → Delete Account, or email <a href="mailto:support@[YOUR_DOMAIN]">support@[YOUR_DOMAIN]</a>. We'll take care of it within 30 days. Some data may be kept a bit longer if the law requires it (like fraud records).</p>
        <p>Full details are in our <a href="/privacy">Privacy Policy</a>.</p>
      </>
    ),
  },
  {
    id: 'ip',
    num: '8',
    title: 'Intellectual Property',
    content: (
      <>
        <p>The platform design, logo, code, and everything built by us belongs to [YOUR_PLATFORM_NAME]. Don't copy it, rebrand it, or reverse-engineer it without asking first.</p>
        <p>Specifically, please don't:</p>
        <ul>
          <li>Copy or redistribute our design or code</li>
          <li>Use our logo or brand name without permission</li>
          <li>Build derivative products based on this platform</li>
          <li>Try to extract or decompile the source code</li>
        </ul>
        <p>Your content — your listings, photos, descriptions — stays yours. We only use it to run the platform, as described in Section 5.</p>
      </>
    ),
  },
  {
    id: 'moderation',
    num: '9',
    title: 'Moderation & Enforcement',
    content: (
      <>
        <p>We want this to be a place people can actually trust. When something gets reported, our team reviews it and decides what to do:</p>
        <ul>
          <li>Remove the listing or content</li>
          <li>Send the user a warning</li>
          <li>Temporarily suspend an account while we look into it</li>
          <li>Permanently ban repeat offenders or serious violations</li>
          <li>Pass illegal activity to the appropriate authorities</li>
        </ul>
        <p>Hit the "Report" button on any listing to flag it. We review reports within 24 hours and keep reporter identities private.</p>
        <p>We make the final call on moderation. If you think we got it wrong, email <a href="mailto:support@[YOUR_DOMAIN]">support@[YOUR_DOMAIN]</a> and we'll take another look.</p>
      </>
    ),
  },
  {
    id: 'disclaimer',
    num: '10',
    title: 'Disclaimers & Limitation of Liability',
    content: (
      <>
        <p>The platform is provided <strong>as is</strong>. We do our best to keep things running smoothly, but we can't make guarantees about:</p>
        <ul>
          <li>Whether any listing is accurate or the item is as described</li>
          <li>The platform being available 24/7 without bugs or downtime</li>
          <li>How a deal between two users turns out</li>
          <li>Who the person on the other side of a chat actually is</li>
        </ul>
        <p>To the extent the law allows, [YOUR_PLATFORM_NAME] isn't liable for losses you experience from using the platform — whether that's a bad deal, a hacked account, or content posted by someone else.</p>
        <p>If we ever are found liable, the most we'd owe you is what you actually paid us in the 12 months before the issue happened.</p>
      </>
    ),
  },
  {
    id: 'termination',
    num: '11',
    title: 'Termination',
    content: (
      <>
        <p>We can suspend or close your account if we believe you've broken these Terms or harmed other users — with or without advance notice, depending on the situation.</p>
        <p>When an account is terminated:</p>
        <ul>
          <li>Access stops immediately</li>
          <li>Your listings and public profile are removed</li>
          <li>Sections 7, 8, and 10 of these Terms still apply to you after the fact</li>
        </ul>
        <p>Want to leave on your own terms? Go to Settings → Delete Account, or email <a href="mailto:support@[YOUR_DOMAIN]">support@[YOUR_DOMAIN]</a>. We'll process it within 30 days.</p>
      </>
    ),
  },
  {
    id: 'changes',
    num: '12',
    title: 'Changes to These Terms',
    content: (
      <>
        <p>These Terms will change sometimes — when laws change, when we add features, or when something needs clarifying. When we make a meaningful update, we'll:</p>
        <ul>
          <li>Update the "Last updated" date at the top of this page</li>
          <li>Email you about it</li>
          <li>Show a notice on the platform for at least 14 days</li>
        </ul>
        <p>If you keep using the platform after an update goes live, that means you're okay with the new Terms. If you're not, you can delete your account — no hard feelings.</p>
      </>
    ),
  },
  {
    id: 'contact',
    num: '13',
    title: 'Contact & Governing Law',
    content: (
      <>
        <p>Got questions about these Terms? Something that doesn't make sense? Just reach out:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:support@[YOUR_DOMAIN]">support@[YOUR_DOMAIN]</a></li>
          <li><strong>Response time:</strong> We aim to get back to you within 2 business days</li>
        </ul>
        <p>These Terms are governed by applicable law. If a dispute comes up, we'd rather sort it out through honest conversation first. If that doesn't work, we'll go through the proper legal channels.</p>
        <p>If one part of these Terms turns out to be unenforceable, everything else still stands.</p>
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
          <p className="tos-page-sub">The short version: be honest, don't post illegal stuff, and treat other people the way you'd want to be treated. The long version is below.</p>
          <div className="tos-page-meta">
            <span>Effective: <strong>[EFFECTIVE_DATE]</strong></span>
            <span className="tos-page-dot">·</span>
            <span>Last updated: <strong>[EFFECTIVE_DATE]</strong></span>
            <span className="tos-page-dot">·</span>
            <a href="mailto:support@[YOUR_DOMAIN]">Questions? Contact us</a>
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
