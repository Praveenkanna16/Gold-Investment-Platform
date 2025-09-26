import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Crown, 
  Calculator, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  DollarSign,
  Target,
  Clock
} from 'lucide-react'
import CountUp from 'react-countup'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { initiateBuy, fetchBalance, fetchPrice } from '../store/slices/goldSlice'
import { openRazorpayCheckout } from '../services/razorpay'
import api from '../services/api'
import toast from 'react-hot-toast'
import { usePolling } from '../utils/usePolling'
import type { RootState } from '../store'
import SIPSection from '../components/SIPSection'

export default function BuyGoldPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [amount, setAmount] = useState<number>(5000)
  const [processing, setProcessing] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string>('custom')
  const loading = useAppSelector((s: RootState)=>s.gold.loading)
  const user = useAppSelector((s: RootState) => s.user.profile)
  const price = useAppSelector((s: RootState) => s.gold.price)

  useEffect(() => {
    dispatch(fetchPrice())
    dispatch(fetchBalance())
  }, [dispatch])

  // Live polling for price and balance
  usePolling(() => dispatch(fetchPrice()), { intervalMs: 10000, immediate: true })
  usePolling(() => dispatch(fetchBalance()), { intervalMs: 15000, immediate: false })

  const currentPrice = Number(price?.pricePerGram ?? 0)
  const goldQuantity = currentPrice > 0 ? amount / currentPrice : 0

  const packages = [
    {
      id: 'micro',
      name: 'Micro Pack',
      amount: 10,
      popular: false,
      icon: Sparkles,
      features: ['Start with just ₹10', 'Test the flow', 'Instant purchase']
    },
    {
      id: 'saver',
      name: 'Saver Pack',
      amount: 100,
      popular: false,
      icon: Target,
      features: ['Great for beginners', 'Low investment', 'Instant purchase']
    },
    {
      id: 'smart',
      name: 'Smart Pack',
      amount: 500,
      popular: false,
      icon: Target,
      features: ['Build habit', 'Good starting point', 'Instant purchase']
    },
    {
      id: 'starter',
      name: 'Starter Pack',
      amount: 2500,
      popular: false,
      icon: Target,
      features: ['Perfect for beginners', 'Low investment risk', 'Instant purchase']
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      amount: 10000,
      popular: true,
      icon: Crown,
      features: ['Most popular choice', 'Better value', 'Priority support']
    },
    {
      id: 'elite',
      name: 'Elite Pack',
      amount: 25000,
      popular: false,
      icon: Sparkles,
      features: ['Maximum returns', 'VIP treatment', 'Exclusive benefits']
    }
  ]

  const onBuy = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    if (amount < 10) {
      toast.error('Minimum purchase amount is ₹10')
      setProcessing(false)
      return
    }
    
    try {
      const res = await dispatch(initiateBuy(amount))
      if ((res as any).error) {
        toast.error((res as any).payload || 'Failed to initiate buy')
        return
      }
      
      const data = (res as any).payload
      const provider = data?.payment?.provider
      const order = data?.payment?.order
      const txId = data?.tx?.id

      if (provider === 'razorpay' && order?.id) {
        const key = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined
        if (!key) {
          toast.error('Razorpay key is not configured')
          setProcessing(false)
          return
        }
        await openRazorpayCheckout({
          key,
          amount: order.amount,
          currency: order.currency || 'INR',
          order_id: order.id,
          name: 'GoldVault',
          description: `Purchase ${goldQuantity.toFixed(4)}g gold`,
          handler: async (response: any) => {
            await handlePaymentSuccess({
              txId,
              userId: user?.id,
              status: 'success',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            })
          },
          prefill: {
            name: user ? `${user.firstName} ${user.lastName}` : '',
            email: user?.email || '',
          },
          theme: {
            color: '#f59e0b',
          },
          modal: {
            ondismiss: () => {
              setProcessing(false)
              toast.error('Payment cancelled')
            },
          },
        })
      } else {
        toast.error(`Unsupported payment provider: ${provider || 'unknown'}`)
      }
    } catch (error) {
      toast.error('Payment failed')
      console.error('Payment error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentSuccess = async (payload: any) => {
    try {
      await api.post('/payments/webhook', payload)
      await dispatch(fetchBalance())
      toast.success('Payment successful! Gold added to your account')
      navigate('/')
    } catch (error) {
      toast.error('Payment completed but failed to update balance')
      console.error('Webhook error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Crown className="h-12 w-12 text-yellow-500" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
              Buy Premium Gold
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Invest in digital gold with instant delivery and secure storage. Start building your wealth today! ✨
          </p>
        </motion.div>

        {/* Live Price Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-6 mb-8 text-white text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <TrendingUp className="h-6 w-6" />
            <span className="text-lg font-semibold">Live Gold Price</span>
          </div>
          <div className="text-3xl font-bold">
            ₹<CountUp end={currentPrice} duration={2} separator="," /> per gram
          </div>
          <p className="text-green-100 mt-2">Updated in real-time • Secure transactions</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Investment Packages */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Investment Package</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {packages.map((pkg, index) => {
                  const Icon = pkg.icon
                  const isSelected = selectedPackage === pkg.id
                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedPackage(pkg.id)
                        setAmount(pkg.amount)
                      }}
                      className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-yellow-400 bg-yellow-50 shadow-xl'
                          : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-lg'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <div className={`inline-flex p-3 rounded-xl mb-4 ${
                          isSelected ? 'bg-yellow-400' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-8 w-8 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                        <div className="text-3xl font-bold text-yellow-600 mb-4">
                          ₹{pkg.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mb-4">
                          ≈ {currentPrice > 0 ? (pkg.amount / currentPrice).toFixed(4) : '—'} grams
                        </div>
                        <ul className="space-y-2">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Custom Amount */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Or Enter Custom Amount</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount (INR)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      min={10}
                      max={1000000}
                      value={amount}
                      onChange={(e) => {
                        setAmount(Number(e.target.value))
                        setSelectedPackage('custom')
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-lg font-semibold"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                
                {/* Amount Slider */}
                <div>
                  <input
                    type="range"
                    min={10}
                    max={100000}
                    step={10}
                    value={amount}
                    onChange={(e) => {
                      setAmount(Number(e.target.value))
                      setSelectedPackage('custom')
                    }}
                    className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>₹10</span>
                    <span>₹1,00,000</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SIP Plans */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mt-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Set up a Gold SIP</h3>
              <SIPSection currentPrice={currentPrice} />
            </motion.div>
          </div>

          {/* Purchase Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Calculator Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Calculator className="h-6 w-6 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-900">Purchase Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Investment Amount</span>
                  <span className="text-lg font-semibold">₹{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Gold Quantity</span>
                  <span className="text-lg font-semibold text-yellow-600">
                    {goldQuantity.toFixed(4)} grams
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Price per gram</span>
                  <span className="text-lg font-semibold">₹{currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="text-lg font-semibold text-green-600">FREE</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-yellow-800">Investment Highlights</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 99.9% pure digital gold</li>
                  <li>• Instant delivery to your vault</li>
                  <li>• Zero storage charges</li>
                  <li>• Sell anytime at market price</li>
                </ul>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-bold text-blue-900">Security & Trust</h3>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Bank-grade encryption
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Insured storage
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Regulatory compliance
                </li>
              </ul>
            </div>

            {/* Purchase Button */}
            <motion.form
              onSubmit={onBuy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="submit"
                disabled={loading || processing || amount < 10 || currentPrice <= 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                  loading || processing || amount < 10 || currentPrice <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white shadow-xl hover:shadow-2xl'
                }`}
              >
                {loading || processing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Buy Gold Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </motion.form>

            <p className="text-xs text-gray-500 text-center">
              🔒 Secure payment • Test mode active • Instant delivery
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
