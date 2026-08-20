<template>
  <div class="view-section">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 25px;">
          
          <!-- Left: Product Selection -->
          <div class="card" style="padding: 25px;">
              <h2 style="margin-bottom: 20px; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                  <Package :size="20" /> Pilih Barang
              </h2>
              
              <div class="search-bar" style="margin-bottom: 20px;">
                  <Search class="search-icon" :size="18" />
                  <input type="text" v-model="searchQuery" placeholder="Cari nama atau kode sparepart..." @input="handleSearch" class="form-control" style="border-radius: 20px; padding: 10px 15px 10px 40px; width: 100%;">
              </div>
              
              <div style="max-height: 500px; overflow-y: auto; padding-right: 10px;">
                  <div v-if="parts.length === 0" style="text-align: center; color: var(--text-muted); padding: 20px;">
                      Tidak ada barang ditemukan.
                  </div>
                  <div v-for="part in parts" :key="part.id" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 15px; background: var(--bg-color);">
                      <div>
                          <div style="font-weight: 600;">{{ part.name }}</div>
                          <div style="font-size: 0.85rem; color: var(--text-muted);">{{ part.part_code }} | Stok: <span :style="{ color: part.stock <= (part.low_stock_threshold || 3) ? '#ef4444' : 'inherit', fontWeight: 'bold' }">{{ part.stock }} {{ part.unit }}</span></div>
                          <div style="color: var(--primary-color); font-weight: 700; margin-top: 5px;">{{ formatCurrency(part.sell_price) }}</div>
                      </div>
                      <button @click="addToCart(part)" class="btn btn-primary" :disabled="part.stock <= 0" style="border-radius: 20px; padding: 8px 16px;">
                          {{ part.stock <= 0 ? 'Habis' : 'Tambah' }}
                      </button>
                  </div>
              </div>
          </div>
          
          <!-- Right: Cart & Payment -->
          <div class="card" style="padding: 25px; display: flex; flex-direction: column;">
              <h2 style="margin-bottom: 20px; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                  <ShoppingCart :size="20" /> Keranjang Belanja
              </h2>
              
              <div class="form-group">
                  <input type="text" v-model="customerName" placeholder="Nama Pelanggan (Opsional)" class="form-control" style="border-radius: var(--radius-md);">
              </div>
              
              <div style="flex: 1; overflow-y: auto; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 15px 0; margin-bottom: 20px;">
                  <div v-if="cart.length === 0" style="text-align: center; color: var(--text-muted); padding: 20px;">
                      Keranjang masih kosong.
                  </div>
                  <div v-for="(item, index) in cart" :key="index" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                      <div style="flex: 1;">
                          <div style="font-weight: 500; font-size: 0.95rem; line-height: 1.2; margin-bottom: 4px;">{{ item.name }}</div>
                          <div style="font-size: 0.85rem; color: var(--text-muted);">{{ formatCurrency(item.price) }}</div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 10px;">
                          <div style="display: flex; align-items: center; background: var(--bg-color); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden;">
                              <button @click="decreaseQty(index)" style="border: none; background: transparent; padding: 4px 8px; cursor: pointer; color: var(--text-primary);">-</button>
                              <span style="font-size: 0.9rem; min-width: 20px; text-align: center;">{{ item.qty }}</span>
                              <button @click="increaseQty(index)" style="border: none; background: transparent; padding: 4px 8px; cursor: pointer; color: var(--text-primary);">+</button>
                          </div>
                          <div style="font-weight: 600; width: 80px; text-align: right;">{{ formatCurrency(item.price * item.qty) }}</div>
                          <button @click="removeFromCart(index)" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;">
                              <X :size="16" />
                          </button>
                      </div>
                  </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; font-size: 1.1rem; margin-bottom: 10px;">
                      <span style="color: var(--text-muted);">Total Belanja:</span>
                      <strong style="color: var(--text-primary); font-size: 1.3rem;">{{ formatCurrency(totalAmount) }}</strong>
                  </div>
                  <div class="form-group" style="margin-bottom: 10px;">
                      <label style="font-size: 0.85rem;">Metode Pembayaran</label>
                      <select v-model="paymentMethod" class="form-control" style="border-radius: var(--radius-sm);">
                          <option value="Tunai">Tunai</option>
                          <option value="Transfer">Transfer</option>
                          <option value="QRIS">QRIS</option>
                      </select>
                  </div>
                  <div class="form-group" v-if="paymentMethod === 'Tunai'">
                      <label style="font-size: 0.85rem;">Nominal Dibayar</label>
                      <input type="number" v-model="cashGiven" class="form-control" style="border-radius: var(--radius-sm); font-size: 1.1rem; font-weight: bold;">
                  </div>
                  <div v-if="paymentMethod === 'Tunai' && cashGiven > 0" style="display: flex; justify-content: space-between; font-size: 1rem; margin-top: 10px; color: var(--text-muted);">
                      <span>Kembalian:</span>
                      <strong :style="{ color: changeAmount >= 0 ? '#10b981' : '#ef4444' }">{{ formatCurrency(changeAmount) }}</strong>
                  </div>
              </div>
              
              <button @click="processSale" class="btn btn-primary" :disabled="cart.length === 0 || (paymentMethod === 'Tunai' && changeAmount < 0)" style="width: 100%; padding: 12px; border-radius: 20px; font-size: 1.1rem; font-weight: 600; display: flex; justify-content: center; gap: 8px;">
                  <CheckCircle :size="20" /> Proses Transaksi
              </button>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Package, Search, ShoppingCart, X, CheckCircle } from 'lucide-vue-next'
import { Toast } from '../utils/toast'
import type { Part } from '../types'
// import { generateSaleReceiptHtml, printHtml } from '../utils/printUtils'

const parts = ref<Part[]>([])
const searchQuery = ref('')
const customerName = ref('')
const paymentMethod = ref('Tunai')
const cashGiven = ref<number | ''>('')

interface CartItem {
  id: number
  name: string
  price: number
  qty: number
  maxStock: number
}
const cart = ref<CartItem[]>([])

const formatCurrency = (val: number | string | undefined | null) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(Number(val || 0))

const loadParts = async () => {
  if (window.api && window.api.getParts) {
      parts.value = (await window.api.getParts(searchQuery.value)) as Part[]
  }
}

let timeoutId: any = null
const handleSearch = () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
      loadParts()
  }, 300)
}

onMounted(() => {
  loadParts()
})

const addToCart = (part: Part) => {
  const existing = cart.value.find(item => item.id === part.id)
  if (existing) {
      if (existing.qty < existing.maxStock) {
          existing.qty++
      } else {
          Toast.fire({ icon: 'warning', title: 'Stok tidak mencukupi' })
      }
  } else {
      cart.value.push({
          id: part.id,
          name: part.name,
          price: part.sell_price,
          qty: 1,
          maxStock: part.stock
      })
  }
}

const increaseQty = (index: number) => {
  const item = cart.value[index]
  if (item.qty < item.maxStock) {
      item.qty++
  } else {
      Toast.fire({ icon: 'warning', title: 'Stok tidak mencukupi' })
  }
}

const decreaseQty = (index: number) => {
  if (cart.value[index].qty > 1) {
      cart.value[index].qty--
  } else {
      removeFromCart(index)
  }
}

const removeFromCart = (index: number) => {
  cart.value.splice(index, 1)
}

const totalAmount = computed(() => {
  return cart.value.reduce((total, item) => total + (item.price * item.qty), 0)
})

const changeAmount = computed(() => {
  if (cashGiven.value === '') return 0 - totalAmount.value
  return Number(cashGiven.value) - totalAmount.value
})

const processSale = async () => {
  if (cart.value.length === 0) return
  if (paymentMethod.value === 'Tunai' && changeAmount.value < 0) {
      return window.Swal.fire('Info', 'Nominal bayar kurang dari total!', 'info')
  }

  const saleData = {
      customer_name: customerName.value,
      total_amount: totalAmount.value,
      payment_method: paymentMethod.value
  }
  
  const items = cart.value.map(item => ({
      spare_part_id: item.id,
      quantity: item.qty,
      price: item.price,
      total: item.price * item.qty
  }))

  try {
      const res = await window.api.createSale(saleData, items)
      if (res.success) {
          window.Swal.fire({
              icon: 'success',
              title: 'Transaksi Berhasil',
              text: 'Apakah Anda ingin mencetak struk?',
              showCancelButton: true,
              confirmButtonText: 'Ya, Cetak Struk',
              cancelButtonText: 'Tidak'
          }).then(async (result: any) => {
              if (result.isConfirmed) {
                  // TODO: Print Receipt for Sales
                  window.Swal.fire('Info', 'Fitur cetak struk POS sedang disiapkan.', 'info')
              }
              // Reset
              cart.value = []
              customerName.value = ''
              cashGiven.value = ''
              paymentMethod.value = 'Tunai'
              searchQuery.value = ''
              await loadParts()
          })
      } else {
          window.Swal.fire('Error', res.error, 'error')
      }
  } catch (error: any) {
      window.Swal.fire('Error', error.message, 'error')
  }
}
</script>

<style scoped>
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
