// Minimal config types and fetcher — mock mode returns defaults directly.

export interface SiteConfig {
  auth: {
    primary_login_id: string;
    require_phone_verification: boolean;
    require_email_verification: boolean;
    allow_guest_checkout: boolean;
    otp_length: number;
    otp_expiry_minutes: number;
    allow_social_login: boolean;
    google_login_enabled: boolean;
    facebook_login_enabled: boolean;
    password_min_length: number;
    force_phone_for_orders: boolean;
  };
  branding: {
    name: string;
    tagline: string;
    logo_url: string;
    favicon_url: string;
    og_image_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    currency: string;
    currency_symbol: string;
    timezone: string;
    country_code: string;
    date_format: string;
    dark_mode_enabled: boolean;
    powered_by_visible: boolean;
  };
  catalog: {
    variant_types: string[];
    default_variant_type: string;
    show_calories: boolean;
    show_nutrition: boolean;
    show_allergens: boolean;
    show_diet_badges: boolean;
    diet_filter_default: string;
    show_ratings: boolean;
    show_out_of_stock: boolean;
    items_per_page: number;
    search_enabled: boolean;
  };
  checkout: {
    cod_enabled: boolean;
    online_pay_enabled: boolean;
    min_order_amount: number;
    packing_charges: number;
    tip_enabled: boolean;
    tip_presets: number[];
    instructions_enabled: boolean;
    scheduled_orders: boolean;
    promo_code_field: boolean;
    gift_wrap_enabled: boolean;
    gift_wrap_price: number;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    instagram: string;
    facebook: string;
    twitter: string;
    google_maps: string;
  };
  delivery: {
    enabled: boolean;
    fee: number;
    free_above: number;
    prep_time_minutes: number;
    pickup_enabled: boolean;
    dine_in_enabled: boolean;
    live_tracking_enabled: boolean;
    max_distance_km: number;
    contactless_default: boolean;
    slot_based_delivery: boolean;
  };
  features: {
    coupons_enabled: boolean;
    promotions_enabled: boolean;
    referral_enabled: boolean;
    reviews_enabled: boolean;
    gift_cards_enabled: boolean;
    reservations_enabled: boolean;
    whatsapp_enabled: boolean;
    whatsapp_phone: string;
    blog_enabled: boolean;
    help_center_enabled: boolean;
    feedback_enabled: boolean;
    self_checkin_enabled: boolean;
    subscription_enabled: boolean;
    table_qr_enabled: boolean;
    student_pass_enabled: boolean;
    meal_plans_enabled: boolean;
  };
  loyalty: {
    enabled: boolean;
    point_name: string;
    point_name_plural: string;
    point_value: number;
    points_per_amount: number;
    points_per_amount_threshold: number;
    healthy_boost_multiplier: number;
    redemption_min_points: number;
    redemption_max_percent: number;
    first_order_bonus: number;
    welcome_bonus: number;
    birthday_bonus: number;
    review_bonus: number;
    expiry_days: number;
    tier_names: string[];
    show_tier_progress: boolean;
  };
  notifications: Record<string, boolean | number>;
  orders: {
    prefix: string;
    auto_confirm: boolean;
    auto_accept_minutes: number;
    reorder_enabled: boolean;
    order_tracking_enabled: boolean;
    receipt_enabled: boolean;
    rating_enabled: boolean;
    rating_mandatory: boolean;
    token_display_enabled: boolean;
    order_types: string[];
    cancel_allowed_minutes: number;
    cancel_refund_enabled: boolean;
    cancel_refund_percent: number;
    max_order_amount: number;
    max_items_per_order: number;
  };
  tax: {
    rate: number;
    label: string;
    inclusive: boolean;
    service_charge_enabled: boolean;
    service_charge_percent: number;
  };
  payments: {
    cod_max_amount: number;
    cod_min_amount: number;
    online_discount: number;
    partial_payment: boolean;
    partial_min_percent: number;
    wallet_enabled: boolean;
    wallet_topup_enabled: boolean;
    upi_enabled: boolean;
    card_enabled: boolean;
    netbanking_enabled: boolean;
    emi_enabled: boolean;
    refund_auto: boolean;
    refund_enabled: boolean;
    refund_percentage: number;
    refund_window_hours: number;
    partial_refund_enabled: boolean;
    refund_to_wallet: boolean;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    canonical_url: string;
    og_type: string;
    twitter_handle: string;
  };
  analytics: {
    google_analytics_id: string;
    facebook_pixel_id: string;
    gtm_id: string;
  };
  app: {
    pwa_enabled: boolean;
    app_store_url: string;
    play_store_url: string;
  };
  system: {
    maintenance_mode: boolean;
    maintenance_message: string;
    coming_soon: boolean;
  };
  property: {
    check_in_time: string;
    check_out_time: string;
    tax_rate: number;
    tax_label: string;
    booking_hold_minutes: number;
    advance_payment_percent: number;
    max_guests_included: number;
    extra_guest_charge: number;
    min_nights: number;
    max_nights: number;
    max_guests_per_unit: number;
    cancellation_hours: number;
    cancellation_fee_percent: number;
    advance_booking_days: number;
    min_stay_nights: number;
  };
  // Groups that don't need typed FE access
  otp: Record<string, unknown>;
  pos: Record<string, unknown>;
  integrations: Record<string, unknown>;
  email: Record<string, unknown>;
}

const DEFAULT_CONFIG: SiteConfig = {
  auth: {
    primary_login_id: 'phone',
    require_phone_verification: true,
    require_email_verification: false,
    allow_guest_checkout: false,
    otp_length: 4,
    otp_expiry_minutes: 5,
    allow_social_login: false,
    google_login_enabled: false,
    facebook_login_enabled: false,
    password_min_length: 8,
    force_phone_for_orders: true,
  },
  branding: {
    name: 'ViCity',
    tagline: 'Your City Escape',
    logo_url: '',
    favicon_url: '',
    og_image_url: '',
    primary_color: '#C9A96E',
    secondary_color: '#1A1A1A',
    accent_color: '#D4AF37',
    font_family: 'Inter',
    currency: 'INR',
    currency_symbol: '\u20B9',
    timezone: 'Asia/Kolkata',
    country_code: 'IN',
    date_format: 'DD/MM/YYYY',
    dark_mode_enabled: false,
    powered_by_visible: true,
  },
  catalog: {
    variant_types: ['default'],
    default_variant_type: 'standard',
    show_calories: false,
    show_nutrition: false,
    show_allergens: false,
    show_diet_badges: false,
    diet_filter_default: 'all',
    show_ratings: true,
    show_out_of_stock: true,
    items_per_page: 12,
    search_enabled: true,
  },
  checkout: {
    cod_enabled: false,
    online_pay_enabled: true,
    min_order_amount: 0,
    packing_charges: 0,
    tip_enabled: false,
    tip_presets: [],
    instructions_enabled: true,
    scheduled_orders: false,
    promo_code_field: true,
    gift_wrap_enabled: false,
    gift_wrap_price: 0,
  },
  contact: {
    phone: '',
    email: '',
    address: '',
    instagram: '',
    facebook: '',
    twitter: '',
    google_maps: '',
  },
  delivery: {
    enabled: false,
    fee: 0,
    free_above: 0,
    prep_time_minutes: 0,
    pickup_enabled: false,
    dine_in_enabled: false,
    live_tracking_enabled: false,
    max_distance_km: 0,
    contactless_default: false,
    slot_based_delivery: false,
  },
  features: {
    coupons_enabled: true,
    promotions_enabled: false,
    referral_enabled: false,
    reviews_enabled: true,
    gift_cards_enabled: false,
    reservations_enabled: false,
    whatsapp_enabled: false,
    whatsapp_phone: '',
    blog_enabled: false,
    help_center_enabled: false,
    feedback_enabled: false,
    self_checkin_enabled: false,
    subscription_enabled: false,
    table_qr_enabled: false,
    student_pass_enabled: false,
    meal_plans_enabled: false,
  },
  loyalty: {
    enabled: false,
    point_name: 'points',
    point_name_plural: 'points',
    point_value: 1,
    points_per_amount: 0,
    points_per_amount_threshold: 0,
    healthy_boost_multiplier: 1,
    redemption_min_points: 0,
    redemption_max_percent: 0,
    first_order_bonus: 0,
    welcome_bonus: 0,
    birthday_bonus: 0,
    review_bonus: 0,
    expiry_days: 365,
    tier_names: [],
    show_tier_progress: false,
  },
  notifications: {
    booking_confirm_sms: true,
    booking_confirm_email: true,
    checkin_reminder: true,
    checkin_reminder_hours: 24,
  },
  orders: {
    prefix: 'TSS',
    auto_confirm: false,
    auto_accept_minutes: 0,
    reorder_enabled: false,
    order_tracking_enabled: false,
    receipt_enabled: true,
    rating_enabled: true,
    rating_mandatory: false,
    token_display_enabled: false,
    order_types: ['booking'],
    cancel_allowed_minutes: 0,
    cancel_refund_enabled: true,
    cancel_refund_percent: 50,
    max_order_amount: 500000,
    max_items_per_order: 10,
  },
  tax: {
    rate: 18,
    label: 'GST',
    inclusive: false,
    service_charge_enabled: false,
    service_charge_percent: 0,
  },
  payments: {
    cod_max_amount: 0,
    cod_min_amount: 0,
    online_discount: 0,
    partial_payment: true,
    partial_min_percent: 50,
    wallet_enabled: false,
    wallet_topup_enabled: false,
    upi_enabled: true,
    card_enabled: true,
    netbanking_enabled: true,
    emi_enabled: false,
    refund_auto: false,
    refund_enabled: true,
    refund_percentage: 100,
    refund_window_hours: 48,
    partial_refund_enabled: true,
    refund_to_wallet: false,
  },
  seo: {
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    og_type: 'website',
    twitter_handle: '',
  },
  analytics: {
    google_analytics_id: '',
    facebook_pixel_id: '',
    gtm_id: '',
  },
  app: {
    pwa_enabled: false,
    app_store_url: '',
    play_store_url: '',
  },
  system: {
    maintenance_mode: false,
    maintenance_message: '',
    coming_soon: false,
  },
  property: {
    check_in_time: '14:00',
    check_out_time: '11:00',
    tax_rate: 18,
    tax_label: 'GST',
    booking_hold_minutes: 10,
    advance_payment_percent: 50,
    max_guests_included: 6,
    extra_guest_charge: 150000,
    min_nights: 1,
    max_nights: 21,
    max_guests_per_unit: 8,
    cancellation_hours: 48,
    cancellation_fee_percent: 25,
    advance_booking_days: 90,
    min_stay_nights: 1,
  },
  otp: {},
  pos: {},
  integrations: {},
  email: {},
};

let _configCache: SiteConfig | null = null;

export async function getSiteConfig(): Promise<SiteConfig> {
  if (_configCache) return _configCache;

  try {
    const { TZ } = await import('@/lib/tz');
    const remote = await TZ.storefront.config.get();
    // Deep-merge remote over defaults so every key is present
    const merged = { ...DEFAULT_CONFIG } as SiteConfig;
    for (const group of Object.keys(remote) as Array<keyof SiteConfig>) {
      if (remote[group] && typeof remote[group] === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (merged as any)[group] = { ...DEFAULT_CONFIG[group] as object, ...remote[group] as object };
      }
    }
    _configCache = merged;
    return merged;
  } catch {
    // Fallback to defaults if config endpoint is unavailable
    return DEFAULT_CONFIG;
  }
}
