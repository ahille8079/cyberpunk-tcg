export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold font-mono text-cyber-yellow tracking-widest mb-2">
          Privacy Policy
        </h1>
        <p className="text-cyber-light/40 font-mono text-xs mb-10">
          Last Updated: March 6, 2026
        </p>
        <div className="prose prose-invert max-w-none text-cyber-light/60 space-y-6 font-mono text-sm leading-relaxed">
          <p>
            This Privacy Policy describes how ripperdeck.gg (&quot;ripperdeck,&quot;
            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and
            shares information when you use our website and services (the
            &quot;Service&quot;). By using the Service, you agree to the
            collection and use of information in accordance with this policy.
          </p>

          <section>
            <h2 className="text-lg font-bold text-cyber-cyan mb-3">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              <strong className="text-cyber-light/80">Account Information:</strong>{" "}
              When you create an account using a third-party authentication
              provider (Discord, Google, or GitHub), we receive and store
              certain information from that provider, including your display
              name, email address, and profile avatar. By authorizing a
              provider to connect with ripperdeck, you consent to our
              collection and storage of this information.
            </p>
            <p className="mb-3">
              <strong className="text-cyber-light/80">User-Generated Content:</strong>{" "}
              We store the decks you create, including deck names, card
              selections, and associated metadata.
            </p>
            <p className="mb-3">
              <strong className="text-cyber-light/80">Usage Data:</strong>{" "}
              We automatically collect certain technical information when you
              visit the Service, including pages viewed, browser type, device
              information, and referring URLs. We use Vercel Analytics to
              gather aggregated, anonymized usage insights.
            </p>
            <p>
              <strong className="text-cyber-light/80">Local Storage:</strong>{" "}
              If you use the Service without an account, deck data is stored
              locally in your browser. We do not have access to locally stored
              data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-cyber-cyan mb-3">
              2. How We Use Your Information
            </h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Provide, operate, and maintain the Service</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Save and sync your decks across devices</li>
              <li>Analyze usage trends to improve the Service</li>
              <li>
                Support marketing efforts, including creating aggregated or
                anonymized audience segments (such as lookalike audiences) for
                advertising purposes
              </li>
              <li>Communicate with you about updates or changes to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-cyber-cyan mb-3">
              3. How We Share Your Information
            </h2>
            <p className="mb-3">
              <strong className="text-cyber-light/80">We do not sell your personal information.</strong>{" "}
              We will never sell your name, email address, or other personal
              data to third parties.
            </p>
            <p className="mb-3">
              We may share information with trusted third-party service
              providers who assist us in operating the Service (e.g., hosting,
              authentication, analytics). These providers are contractually
              obligated to use your information only as necessary to provide
              their services to us.
            </p>
            <p>
              We may also use aggregated or de-identified data derived from
              user information for advertising purposes, such as building
              audience segments. This data cannot reasonably be used to
              identify you personally.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-cyber-cyan mb-3">
              4. Third-Party Services
            </h2>
            <p>
              The Service integrates with third-party platforms for
              authentication (Discord, Google, GitHub) and infrastructure
              (Supabase, Vercel). These services have their own privacy
              policies, and we encourage you to review them. We are not
              responsible for the privacy practices of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-cyber-cyan mb-3">
              5. Data Retention
            </h2>
            <p>
              We retain your account information and user-generated content for
              as long as your account is active or as needed to provide the
              Service. If you wish to delete your account and associated data,
              please contact us at the email address below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-cyber-cyan mb-3">
              6. Data Security
            </h2>
            <p>
              We implement commercially reasonable security measures to protect
              your information. However, no method of transmission over the
              internet or electronic storage is completely secure, and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-cyber-cyan mb-3">
              7. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not directed to children under the age of 16. We
              do not knowingly collect personal information from children under
              16. If we become aware that we have collected such information,
              we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-cyber-cyan mb-3">
              8. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you may have rights regarding
              your personal information, including the right to access,
              correct, or delete your data. To exercise these rights, please
              contact us using the information below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-cyber-cyan mb-3">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will revise the &quot;Last Updated&quot; date at the top of
              this page. Your continued use of the Service after any changes
              constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-cyber-cyan mb-3">
              10. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:v@ripperdeck.gg"
                className="text-cyber-cyan hover:underline"
              >
                v@ripperdeck.gg
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
