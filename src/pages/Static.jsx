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

export function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      subtitle="The rules of the road. Pretty reasonable stuff."
      sections={[
        {
          title: 'Your account',
          content: 'Use your real name and a valid email. Don\'t share your login with others. If someone gets into your account because you shared your password, that\'s on you. One account per person — no exceptions.',
        },
        {
          title: 'What you can post',
          content: 'Only list things you actually own and are allowed to sell. Be honest about condition, what\'s included, and any known defects. If your listing is misleading, it\'ll be taken down — and repeat offenders get banned.',
        },
        {
          title: 'What you cannot post',
          content: 'No weapons, drugs, counterfeit items, stolen goods, adult content, or anything illegal where you are. No spam, no fake listings, no scraping the platform. We\'re not a grey market.',
        },
        {
          title: 'Deals are between you two',
          content: 'We connect buyers and sellers — we don\'t handle payments, shipping, or disputes. Meet in public, check the item before you pay, and use common sense. If a deal feels off, trust your gut.',
        },
        {
          title: 'Moderation',
          content: 'Listings and accounts that break these rules get removed. Anyone can report a listing using the report button. Our moderators review every report and make the final call.',
        },
        {
          title: 'We can change things',
          content: 'We may update these terms when needed. If something major changes, we\'ll let you know. Continuing to use the platform means you\'re okay with the current terms.',
        },
      ]}
    />
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
