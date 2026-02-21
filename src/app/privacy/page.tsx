export const revalidate = 86400; // 1 day

export default function PrivacyPage() {
  return (
    <main className="bg-[#f6f8f7] min-h-screen px-6 lg:px-20 pt-10 pb-24">
      <div className="max-w-[900px] mx-auto bg-white border border-[#e0e8e3] rounded-3xl p-8 sm:p-10 shadow-sm">
        <h1 className="text-4xl font-black text-[#111713]">Privacy Policy</h1>
        <p className="mt-3 text-[#648770] font-medium">
          Effective date: {new Date().toISOString().slice(0, 10)}
        </p>

        <div className="mt-8 space-y-6 text-[#111713]">
          <section>
            <h2 className="text-xl font-black">1) What we collect</h2>
            <p className="mt-2 text-[#648770] font-medium leading-7">
              We may collect business contact details you submit (such as email, phone number,
              company name) and basic usage data needed to improve the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black">2) How we use information</h2>
            <p className="mt-2 text-[#648770] font-medium leading-7">
              We use your information to provide market updates, respond to bulk quote enquiries,
              improve platform reliability, and communicate service-related updates.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black">3) Sharing</h2>
            <p className="mt-2 text-[#648770] font-medium leading-7">
              We do not sell your personal data. We may share information only when required to
              fulfill a request (e.g., logistics/fulfillment partners) or to comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black">4) Cookies</h2>
            <p className="mt-2 text-[#648770] font-medium leading-7">
              We may use cookies or similar technologies for basic functionality, analytics, and to
              improve user experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black">5) Your choices</h2>
            <p className="mt-2 text-[#648770] font-medium leading-7">
              You can request correction or deletion of your submitted contact details by contacting us.
              You may also unsubscribe from email updates at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black">6) Contact</h2>
            <p className="mt-2 text-[#648770] font-medium leading-7">
              For privacy questions, contact us via WhatsApp or phone listed in the footer.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}