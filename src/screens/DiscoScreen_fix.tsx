// Add this function inside your DiscoScreen component
const surpriseMe = () => {
  // Select random filters
  const randomFilters: Record<string, string> = {};
  
  filters.forEach(filter => {
    const randomIndex = Math.floor(Math.random() * filter.options.length);
    randomFilters[filter.id] = filter.options[randomIndex].id;
  });
  
  setSelectedFilters(randomFilters);
  
  // Wait a moment for state to update, then start discovery
  setTimeout(() => {
    startDiscovery();
  }, 100);
};

// Replace the "Surprise me!" button with this:
<TouchableOpacity style={styles.randomButton} onPress={surpriseMe}>
  <Ionicons name="dice-outline" size={20} color={dscvrColors.electricMagenta} />
  <Text style={styles.randomButtonText}>Surprise me!</Text>
</TouchableOpacity>
