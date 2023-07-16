const instance = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'X-Requested-With': 'XMLHttpRequest'
	},
	// `timeout` 指定请求超时的毫秒数(0 表示无超时时间)
	// 如果请求话费了超过 `timeout` 的时间，请求将被中断
	timeout: 10000,
});

instance.interceptors.request.use(

	function (config) {

		config = config || { loading: true, servMsg: false, servMsgSync: false };

		config.loading = config.loading !== false
		config.servMsg = config.servMsg === true // 是否显示服务端发来的成功消息
		config.servMsgSync = config.servMsgSync === true //服务端成功消息是否同步显示

		config['headers'][HEADER_TOKEN] = getToken(); // 请求时带上token

		const source = CancelToken.source();// 创建一个取消令牌资源
		config['cancelToken'] = source.token;// 从资源中获得取消令牌，并在请求的cancelToken配置项上配置取消令牌
		if (!requestInfoPool.putRequstInfo(config)) { //存在没有结束的相同请求
			source.cancel('重复请求 ' + config.url + ' 已被阻止。');//取消请求
			//console.error('阻止重复请求：', config);
			return config;
		}

		if (config.loading) { //如果设置显示loading

			loadingCount.count++;
			if (!sureLoading.loading) sureLoading.show();
		}

		return config;
	},
	function (error) {
		// 对请求错误做些什么
		message.error('请求失败！');
		return Promise.reject(error);
	}
);