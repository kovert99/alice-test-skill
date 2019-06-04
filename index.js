const { json } = require('micro');
const axios = require('axios');

require('dotenv').config();

module.exports = async (req, res) => {
	const { request, session, version } = await json(req);
	const { command } = request;
	let clearCommand = command.toLowerCase();

	let vehicleNumber, clearVehicleNumber, responseText;

	if (!command) responseText = 'Здравствуйте, я помогу вам найти местонахождение автомобиля по его гос-номеру. Например, спросите меня: где находится К-123-М-Н';
	else if (clearCommand.indexOf('помощь') !== -1 || clearCommand.indexOf('умее') !== -1 || clearCommand.indexOf('делае') !== -1) responseText = 'Я назову текущее местонахождение автомобиля по его гос-номеру. Например, спросите меня: где К-123-М-Н';
	else {
		commandParts = command.split('находится');

		if (commandParts[1]) {
			vehicleNumber = commandParts[1].toString();
			clearVehicleNumber = vehicleNumber.split(' ').join('').split('-').join('');
			
			if (!clearVehicleNumber || clearVehicleNumber.length != 6) responseText = 'Гос-номер автомобиля указан не верно. Пример правильного номера: К-123-М-Н';
			else {
				// демо-данные
				const vehicle = {
					'к123мн': {
						'coordinates': [52.297113, 54.901383]
					},
					'а321ав': {
						'coordinates': [52.296503, 54.894555]
					},
					'р456ук': {
						'coordinates': [52.304791, 54.896724]
					},
					'к201рв': {
						'coordinates': [52.317364, 54.896470]
					}
				}[clearVehicleNumber];

				if (!vehicle) responseText = 'В нашей базе данных нет автомобиля с гос-номером: ' + vehicleNumber;
				else {
					let GeoObject;
console.log('process.env', process.env);
					
					try {
						// получаем адрес по координатам
						const { data } = await axios.get('https://geocode-maps.yandex.ru/1.x/?apikey=' + process.env.YANDEX_MAPS_API_KEY + '&geocode=' + vehicle.coordinates.join(',') + '&format=json');
						
						if (data.response && data.response.GeoObjectCollection) {
							const { featureMember } = data.response.GeoObjectCollection;

							// получаем улицу объекта
							if (featureMember[0]) GeoObject = featureMember[0].GeoObject;
						};
					} catch (error) { 
						console.log(error); 
					};

					if (!GeoObject) responseText = 'Координаты автомобиля: ' + vehicle.coordinates.join(', ');
					else responseText = 'Автомобиль находится по адресу: ' + GeoObject.name + ' [' + vehicle.coordinates.join(', ') + ']';
				};
			};
		} else responseText = 'Я вас не понял.';
	};

	const result = {
		version,
		session,
		response: {
			text: responseText,
			end_session: false
		}
	};

	res.write(JSON.stringify(result));
	res.end();
};