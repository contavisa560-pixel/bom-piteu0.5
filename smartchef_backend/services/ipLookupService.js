const axios = require('axios');

class IpLookupService {
  static async getIpDetails(ip) {
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      return {
        ip,
        location: 'Localhost',
        city: 'Local',
        region: '',
        country: 'Local',
        org: 'Desenvolvimento',
        isLocal: true
      };
    }

    try {
      // Usa ipapi.co (gratuito, 1000 requests/mês)
      const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
        timeout: 3000
      });
      const data = response.data;
      if (data.error) throw new Error(data.reason);

      return {
        ip,
        location: `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`,
        city: data.city,
        region: data.region,
        country: data.country_name,
        org: data.org,
        isp: data.org,
        latitude: data.latitude,
        longitude: data.longitude,
        isLocal: false
      };
    } catch (error) {
      console.warn(` Falha ao obter geolocalização para IP ${ip}:`, error.message);
      return {
        ip,
        location: 'Localização não disponível',
        city: 'Desconhecida',
        region: '',
        country: '',
        org: '',
        isLocal: false
      };
    }
  }
}

module.exports = IpLookupService;