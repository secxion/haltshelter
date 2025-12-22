import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: December 13, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on 
              HALTSHELTER's website for personal, non-commercial transitory viewing only. This is the grant of a license, 
              not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Disclaimer</h2>
            <p>The materials on HALTSHELTER's website are provided on an 'as is' basis. HALTSHELTER makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
              of intellectual property or other violation of rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Limitations</h2>
            <p>In no event shall HALTSHELTER or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to 
              use the materials on HALTSHELTER's website, even if HALTSHELTER or a HALTSHELTER authorized representative 
              has been notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Accuracy of Materials</h2>
            <p>The materials appearing on HALTSHELTER's website could include technical, typographical, or photographic errors. 
              HALTSHELTER does not warrant that any of the materials on our website are accurate, complete, or current. 
              HALTSHELTER may make changes to the materials contained on our website at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Links</h2>
            <p>HALTSHELTER has not reviewed all of the sites linked to its website and is not responsible for the contents 
              of any such linked site. The inclusion of any link does not imply endorsement by HALTSHELTER of the site. 
              Use of any such linked website is at the user's own risk.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Modifications</h2>
            <p>HALTSHELTER may revise these terms of service for its website at any time without notice. By using this website, 
              you are agreeing to be bound by the then current version of these terms of service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Governing Law</h2>
            <p>The materials appearing on HALTSHELTER's website are governed by and construed in accordance with the laws 
              of the jurisdiction in which HALTSHELTER is located, and you irrevocably submit to the exclusive jurisdiction 
              of the courts in that location.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact us at:</p>
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

export default Terms;
