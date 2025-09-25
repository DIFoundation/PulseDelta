# PulseDelta Prediction Market Platform - Frontend Design Prompt

## Overview

Design and develop a modern, mobile-first prediction market platform for the BlockDAG blockchain. The platform should enable users to create, trade, and manage prediction markets with a seamless DAG token experience.

## Core Features to Implement

### 1. Market Creation Flow

- **Market Type Selection**: Binary (Yes/No), Multi-outcome, Scalar markets
- **Market Configuration Form**:
  - Question/Title input
  - Description/Details
  - End date/time picker
  - Initial liquidity amount (in DAG)
  - Market category selection
- **DAG Deposit**: Seamless conversion from native DAG to wDAG
- **Preview & Confirm**: Review market details before creation

### 2. Trading Interface

- **Market Discovery**: Browse active markets with filters (category, volume, time remaining)
- **Market Detail Pages**:
  - Market question and description
  - Current odds/prices
  - Trading volume and participant count
  - Time remaining
  - Liquidity information
- **Trading Panel**:
  - Buy/Sell outcome tokens
  - Amount input with DAG conversion
  - Price impact display
  - Transaction preview
- **Portfolio Management**: View holdings, P&L, trading history

### 3. Liquidity Provider (LP) System

- **LP Dashboard**:
  - Add liquidity to markets
  - View LP token holdings
  - Track fee earnings
  - Remove liquidity interface
- **LP Analytics**:
  - Fee distribution breakdown
  - Historical performance
  - Market-specific LP stats

### 4. Oracle Reporting System

- **Reporter Interface**:
  - Submit market results
  - Upload supporting evidence
  - Bond submission (wDAG)
  - Dispute resolution interface
- **Result Verification**:
  - Review submitted results
  - Evidence display
  - Voting on disputes

### 5. Market Resolution & Claims

- **Resolution Process**:
  - View final results
  - Claim winnings
  - Automatic payout processing
- **History**: Completed markets and outcomes

## Design System

### Color Palette

- **Primary**: Deep blue (#1a365d) - Trust, stability
- **Secondary**: Electric blue (#3182ce) - Action, engagement
- **Accent**: Bright cyan (#00bcd4) - Highlights, CTAs
- **Success**: Forest green (#38a169) - Profits, positive outcomes
- **Warning**: Amber (#d69e2e) - Caution, pending states
- **Error**: Red (#e53e3e) - Losses, errors
- **Neutral**:
  - Light gray (#f7fafc) - Backgrounds
  - Medium gray (#718096) - Secondary text
  - Dark gray (#2d3748) - Primary text

### Typography

- **Primary Font**: Inter (clean, modern, excellent readability)
- **Monospace**: JetBrains Mono (for addresses, amounts)
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### UI Components

- **Buttons**:
  - Primary: Solid background with white text
  - Secondary: Outline style with colored border
  - Ghost: Transparent with colored text
  - Sizes: Small, Medium, Large
- **Cards**: Subtle shadows, rounded corners, hover effects
- **Forms**: Clean inputs with validation states
- **Charts**: Interactive price charts, volume graphs
- **Modals**: Centered, backdrop blur, smooth animations

### Layout Principles

- **Mobile-First**: Design for mobile, enhance for desktop
- **Grid System**: 12-column responsive grid
- **Spacing**: Consistent 8px base unit
- **Breakpoints**:
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px+

## Page Structure

### 1. Landing Page

- **Hero Section**:
  - Compelling headline about prediction markets
  - Key value propositions
  - Call-to-action buttons
- **Featured Markets**: Highlighted active markets
- **How It Works**: Step-by-step explanation
- **Statistics**: Platform metrics (total volume, active markets, users)

### 2. Markets Page

- **Search & Filters**:
  - Search bar
  - Category filters
  - Sort options (volume, time, odds)
- **Market Grid**: Card-based layout showing:
  - Market question
  - Current odds
  - Volume
  - Time remaining
  - Category badge

### 3. Market Detail Page

- **Header Section**:
  - Market question
  - Category and status
  - Time remaining countdown
- **Trading Panel**:
  - Current prices/odds
  - Buy/Sell interface
  - Order book (if applicable)
- **Market Information**:
  - Description
  - Liquidity details
  - Participant count
  - Trading volume chart
- **Comments/Discussion**: Community engagement section

### 4. Create Market Page

- **Step-by-Step Wizard**:
  - Step 1: Market type selection
  - Step 2: Question and details
  - Step 3: Configuration (end date, liquidity)
  - Step 4: Review and confirm
- **Progress Indicator**: Visual progress through steps
- **Validation**: Real-time form validation with helpful error messages

### 5. Portfolio Page

- **Overview Dashboard**:
  - Total portfolio value
  - P&L summary
  - Active positions
- **Holdings**: List of owned outcome tokens
- **Trading History**: Transaction log with filters
- **LP Positions**: Liquidity provider holdings and earnings

### 6. LP Dashboard

- **Add Liquidity**:
  - Market selection
  - Amount input
  - Fee preview
- **LP Holdings**:
  - LP token balances
  - Fee earnings
  - Performance metrics
- **Remove Liquidity**: Withdrawal interface

### 7. Reporter Dashboard

- **Submit Results**:
  - Market selection
  - Result input (varies by market type)
  - Evidence upload
  - Bond submission
- **Active Reports**: Pending submissions
- **Dispute Resolution**: Voting interface

## User Experience Considerations

### Onboarding

- **Wallet Connection**: Seamless Web3 wallet integration
- **DAG Conversion**: Automatic native DAG to wDAG conversion
- **Tutorial**: Interactive walkthrough for new users
- **Tooltips**: Contextual help throughout the interface

### Mobile Experience

- **Touch-Friendly**: Large tap targets, swipe gestures
- **Responsive Charts**: Mobile-optimized data visualization
- **Simplified Navigation**: Bottom tab bar, collapsible menus
- **Fast Loading**: Optimized images, lazy loading

### Performance

- **Real-Time Updates**: WebSocket connections for live data
- **Caching**: Smart caching of market data and user preferences
- **Progressive Loading**: Load critical content first
- **Error Handling**: Graceful error states with retry options

## Technical Integration Points

### Smart Contract Integration

- **Contract Addresses**: Environment-based configuration
- **ABI Integration**: Type-safe contract interactions
- **Event Listening**: Real-time updates from blockchain events
- **Transaction Management**: Gas estimation, confirmation handling

### Data Management

- **Market Data**: Real-time price feeds, volume tracking
- **User Data**: Portfolio tracking, transaction history
- **Oracle Data**: Result submissions, dispute information
- **Analytics**: Trading patterns, market performance

### Security Considerations

- **Input Validation**: Client-side and server-side validation
- **Transaction Signing**: Secure wallet integration
- **Error Boundaries**: Graceful error handling
- **Rate Limiting**: Prevent spam and abuse

## Accessibility

- **WCAG Compliance**: Meet accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and descriptions
- **Color Contrast**: Sufficient contrast ratios
- **Font Scaling**: Support for user font size preferences

## Testing Strategy

- **Unit Tests**: Component-level testing
- **Integration Tests**: Contract interaction testing
- **E2E Tests**: Complete user flow testing
- **Performance Tests**: Load testing and optimization
- **Accessibility Tests**: Automated accessibility checking

## Deployment Considerations

- **Environment Configuration**: Development, staging, production
- **CDN Integration**: Global content delivery
- **Monitoring**: Error tracking, performance monitoring
- **Analytics**: User behavior tracking and insights

This comprehensive prompt should guide the development of a professional, user-friendly prediction market platform that leverages the full potential of the BlockDAG blockchain and provides an excellent user experience across all devices.
