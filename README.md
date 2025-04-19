# Fees.Fun - Solana Fee Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

![Fees.Fun Logo](/public/assets/logo_chipz.png)

A Next.js-based application for tracking and analyzing Solana wallet transaction fees, with a focus on pump.fun and Raydium DEX interactions.

## 🌟 Features

- **Wallet Fee Analysis**: Track total fees spent on Solana transactions
- **DEX Fee Tracking**: Separate tracking for pump.fun and Raydium DEX-related fees
- **Bot Fee Detection**: Identification and tracking of bot fees in pump.fun transactions
- **Leaderboard**: Compare your fees with other users
- **Rewards System**: Get rewarded based on your fee spending
- **Solana Wallet Integration**: Connect directly with your Solana wallet
- **Result Sharing**: Generate and share your fee analysis results

## 🔧 Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: TailwindCSS for responsive design
- **Blockchain**: Solana Web3.js and Wallet Adapter
- **API Integration**: Solscan API for transaction data
- **Analytics**: Dune Analytics integration for broader trends
- **Database**: Supabase for data persistence
- **Image Generation**: html-to-image for creating shareable cards
- **Cloud Storage**: Cloudinary for image hosting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Solscan API token (register at [Solscan](https://solscan.io))
- Optional: Supabase account for database features

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/feesfunmvp.git
   cd feesfunmvp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SOLSCAN_TOKEN=your_solscan_api_token
   # Optional: Supabase configuration if using the database features
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Optional: Cloudinary configuration if using image sharing
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## 🔍 How It Works

The application fetches transaction data from the Solscan API for a specified wallet address, analyzes the transactions to identify various types of fees, and presents this information in an interactive dashboard.

### Fee Analysis Components:

- **Total Fees**: The sum of all transaction fees paid by the wallet
- **DEX Fees**: Fees specifically related to DEX interactions (pump.fun and Raydium)
- **Bot Fees**: Potential bot fees from pump.fun transactions, identified by analyzing outgoing SOL transfers
- **Historical Data**: Transaction trends over time when sufficient data is available

## 📊 Data Analysis Algorithm

The core algorithm analyzes Solana transactions to identify:

1. Regular transaction fees
2. DEX interaction fees with pump.fun and Raydium
3. Bot fees by detecting smaller SOL transfers in pump.fun transactions

The application uses pagination to efficiently process large transaction histories while respecting API rate limits.

## 📖 API Reference

### Solscan API Endpoints Used:

- `https://pro-api.solscan.io/v2.0/account/transactions` - Fetch wallet transactions
- `https://pro-api.solscan.io/v2.0/transaction/actions` - Get transaction details
- `https://pro-api.solscan.io/v2.0/transaction/detail` - Analyze transaction specifics

## 🤝 Contributing

Contributions are very welcome! Here's how you can contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code adheres to the existing style and includes appropriate tests.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
