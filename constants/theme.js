export const COLORS = {
  primary: '#233186',
  secondary: '#F2A247',
  white: '#FFFFFF',
  background: '#FFFFFF',
  text: '#233186',
  lightGray: '#F5F5F5',
  gray: '#808080',
  error: '#FF6B6B',
  success: '#4CAF50',
};

export const SHADOWS = {
  small: {
    shadowColor: '#233186',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#233186',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#233186',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 6.27,
    elevation: 8,
  },
};

export const FONTS = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.gray,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
};

export const COMMON_STYLES = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    ...SHADOWS.small,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    color: COLORS.text,
  },
}; 