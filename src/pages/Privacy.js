import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="text-red-600 hover:text-red-700 font-semibold mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: December 13, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              HALTSHELTER ("we," "us," "our," or "Company") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect on 
              our site includes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Personal identification information (name, email address, phone number, etc.)</li>
              <li>Donation and payment information</li>
              <li>Volunteer and foster application details</li>
              <li>Newsletter subscription information</li>
              <li>Website usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. 
              Specifically, we may use information collected about you via the Site to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Process your donations and transactions</li>
              <li>Send you promotional communications and newsletters</li>
              <li>Manage volunteer and foster applications</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3a. Legal Basis for Processing</h2>
            <p>Where applicable, we process personal information under one or more of the following legal bases:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your consent</li>
              <li>Performance of a legitimate nonprofit purpose</li>
              <li>Compliance with legal obligations</li>
              <li>Legitimate interests in operating and protecting our organization, provided such interests do not override your rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Sharing and Disclosure of Information</h2>
            <p>We may share information only in limited circumstances:</p>
            <div className="space-y-4 mt-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">4.1 Service Providers</h3>
                <p>With trusted third parties that perform services on our behalf, such as:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Payment processing</li>
                  <li>Website hosting and analytics</li>
                  <li>Email communication platforms</li>
                </ul>
                <p className="mt-2">These providers are contractually obligated to protect your information and use it only for the services provided.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">4.2 Legal Requirements</h3>
                <p>We may disclose information if required to do so by law, regulation, court order, or governmental authority.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">4.3 Protection of Rights</h3>
                <p>To protect the rights, safety, property, or integrity of HALTSHELTER, our beneficiaries (animals), supporters, or the public.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Donations and Financial Transparency</h2>
            <p>As a non-taxable nonprofit organization:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Donations are used strictly to further HALTSHELTER's mission</li>
              <li>Financial records are maintained in accordance with applicable nonprofit and charity laws</li>
              <li>Donor information is kept confidential and is not publicly disclosed without consent, except where required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Data Security</h2>
            <p>HALTSHELTER implements reasonable administrative, technical, and organizational safeguards to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure.</p>
            <p className="mt-3">While we strive to protect your data, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy, please contact us at:</p>
            <div className="bg-gray-100 p-4 rounded mt-2">
              <p className="font-semibold">HALTSHELTER</p>
              <p>Email: contact@haltshelter.org</p>
              <p>Phone: +1 (805) 452-9111</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
