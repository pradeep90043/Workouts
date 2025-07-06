module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@context': './src/context',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@components': './src/components',
            '@utils': './src/utils'
          },
        },
      ],
    ],
  };
};