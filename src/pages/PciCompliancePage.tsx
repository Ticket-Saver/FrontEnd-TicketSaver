export default function PCICompliancePage() {
  return (
    <>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">PCI Compliance </h1>
        <p className="text-lg mb-4">
          At Ticket Saver, we take the security of your payment information very seriously. We are
          committed to maintaining Payment Card Industry Data Security Standard (PCI DSS) compliance
          to ensure the protection of your sensitive data.
        </p>
        <p className="text-lg mb-4">
          Our payment processing system is designed to adhere to the highest standards of security
          to safeguard your personal and financial information. Here are some of the measures we
          have in place to maintain PCI compliance:
        </p>

        <div className="pl-5">
          <p className="text-lg mb-4">
            • Secure Sockets Layer (SSL) encryption: We use SSL encryption to protect the
            transmission of data between your browser and our servers, ensuring that your
            information remains confidential.
          </p>
          <p className="text-lg mb-4">
            • Tokenization: We tokenize payment information to replace sensitive data with unique
            identification symbols, reducing the risk of unauthorized access to cardholder data.
          </p>
          <p className="text-lg mb-4">
            • Access control: We restrict access to cardholder data to authorized personnel only and
            implement strong authentication measures to prevent unauthorized access.
          </p>
        </div>

        <p className="text-lg mb-4">
          By complying with PCI DSS requirements, Ticket Saver aims to provide you with a secure and
          reliable platform for purchasing tickets online. If you have any questions or concerns
          about our security measures, please feel free to contact us at
        </p>

        <a href="mailto:support@ticketsaver.net" className="text-blue-500 hover:underline text-xl">
          support@ticketsaver.net
        </a>

        <p className="text-lg mb-4">
          Thank you for choosing Ticket Saver for your ticketing needs.
        </p>
      </div>
    </>
  )
}
