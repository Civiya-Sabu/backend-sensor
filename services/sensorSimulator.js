// services/sensorSimulator.js

class SensorSimulator {
    constructor() {
      this.interval = null;
      this.isRunning = false;
      this.sensors = {
        temperature: {
          value: 22.0,
          min: 15.0,
          max: 35.0,
          unit: '°C',
          fluctuation: 0.5
        },
        humidity: {
          value: 45.0,
          min: 30.0,
          max: 90.0,
          unit: '%',
          fluctuation: 2.0
        },
        pressure: {
          value: 1013.0,
          min: 990.0,
          max: 1030.0,
          unit: 'hPa',
          fluctuation: 1.0
        },
        cpuLoad: {
          value: 25.0,
          min: 5.0,
          max: 95.0,
          unit: '%',
          fluctuation: 7.0
        },
        memoryUsage: {
          value: 60.0,
          min: 20.0,
          max: 95.0,
          unit: '%',
          fluctuation: 5.0
        },
        networkTraffic: {
          value: 2.5,
          min: 0.1,
          max: 10.0,
          unit: 'MB/s',
          fluctuation: 0.8
        }
      };
      
      // Store historical data
      this.history = {};
      Object.keys(this.sensors).forEach(key => {
        this.history[key] = [];
      });
    }
  
    // Generate slightly random but realistic sensor fluctuations
    updateSensorValues() {
      for (const [key, sensor] of Object.entries(this.sensors)) {
        // Random walk algorithm - values drift slightly up or down
        const change = (Math.random() - 0.5) * 2 * sensor.fluctuation;
        let newValue = sensor.value + change;
        
        // Keep within min/max bounds
        if (newValue > sensor.max) newValue = sensor.max;
        if (newValue < sensor.min) newValue = sensor.min;
        
        this.sensors[key].value = parseFloat(newValue.toFixed(1));
      }
      
      const timestamp = new Date();
      const data = {
        timestamp,
        sensors: Object.fromEntries(
          Object.entries(this.sensors).map(([key, sensor]) => [
            key, 
            { 
              value: sensor.value, 
              unit: sensor.unit 
            }
          ])
        )
      };
      
      // Store historical data (keep last 100 readings)
      for (const [key, sensor] of Object.entries(data.sensors)) {
        this.history[key].push({
          time: timestamp,
          value: sensor.value
        });
        
        // Keep history capped at 100 entries per sensor
        if (this.history[key].length > 100) {
          this.history[key].shift();
        }
      }
      
      return data;
    }
  
    // Start the simulator with a given update interval
    start(io, interval = 2000) {
      if (this.interval) {
        clearInterval(this.interval);
      }
      
      this.isRunning = true;
      this.interval = setInterval(() => {
        const data = this.updateSensorValues();
        io.emit('sensor-data', data);
      }, interval);
      
      return true;
    }
  
    // Stop the simulator
    stop() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
        this.isRunning = false;
        return true;
      }
      return false;
    }
    
    // Get simulator status
    getStatus() {
      return {
        running: this.isRunning,
        sensorCount: Object.keys(this.sensors).length,
        sensors: Object.keys(this.sensors).map(key => ({
          name: key,
          currentValue: this.sensors[key].value,
          unit: this.sensors[key].unit
        }))
      };
    }
    
    // Get historical data for a specific sensor or all sensors
    getHistory(sensorType = null) {
      if (sensorType && this.history[sensorType]) {
        return { [sensorType]: this.history[sensorType] };
      }
      return this.history;
    }
  }
  
  module.exports = new SensorSimulator();