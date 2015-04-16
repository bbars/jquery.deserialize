(function($)
	{
	/**
	 * jQuery.deserialize plugin
	 * Fills elements in selected containers with data extracted from URLencoded string
	 * @param data URLencoded data or array of key-value pairs (jQuery.serializeArray() compatible) or plain object
	 * @param clearForm if true form will be cleared prior to deserialization
	 */
	$.fn.deserialize = function(data, clearForm)
		{
		this.each(function()
			{
			deserialize(this, data, !!clearForm);
			});
		};

	/**
	 * Fills specified form with data extracted from string
	 * @param element form to fill
	 * @param data URLencoded data or array of key-value pairs (jQuery.serializeArray() compatible) or plain object
	 * @param clearForm if true form will be cleared prior to deserialization
	 */
	function deserialize(element, data, clearForm)
		{
		var keyvals = {},
			i = 0,
			split = null,
			key = null,
			value = null,
			splitParts = null,
			selectorElemsVal = 'select,input:not([type=submit],[type=button],[type=reset],[type=reset],[type=checkbox],[type=radio]),textarea',
			selectorElemsChecked = 'input[type="checkbox"],input[type="radio"]';
		
		if (clearForm)
			{
			$(selectorElemsChecked, element).removeAttr('checked');
			$(selectorElemsVal, element).val('');
			}
		
		if (typeof data == 'string')
			{
			data = data.split('&');
			while (split = data[i++])
				{
				splitParts = split.split('=', 2);
				key = decodeURIComponentPlus(splitParts[0] || '');
				value = splitParts.length > 1 ? decodeURIComponentPlus(splitParts[1]) : true;
				
				if (key != '')
					{
					if (key in keyvals)
						{
						if ($.type(keyvals[key]) !== 'array')
							keyvals[key] = [keyvals[key]];
						
						keyvals[key].push(value);
						}
					else
						keyvals[key] = value;
					}
				}
			}
		else if (typeof data == 'object')
			{
			if (data.constructor.name == 'Array')
				{
				for (i = 0; i < data.length; i++)
					keyvals[data[i].name] = data[i].value;
				}
			else
				keyvals = data;
			}
		
		for (key in keyvals)
			{
			value = keyvals[key];
			
			/*
			// Guess checkboxes mode:
			$(selectorElemsChecked, element)
				.filter(function()
					{
					return this.name == key && ($(this).val() == value || $(this).is('[type=checkbox]'));
					})
				.prop('checked', !!value);
			*/
			
			$(selectorElemsChecked, element)
				.filter('[name="'+ key +'"]')
				.prop('checked', false)
				.filter(function() { return $(this).val() == value; })
				.prop('checked', true);
			$(selectorElemsVal, element)
				.filter('[name="'+ key +'"]')
				.val(value);
			}
		}
		
	function decodeURIComponentPlus(s)
		{
		return decodeURIComponent(s ? (s+'').replace(/\+/g, '%20') : '');
		}
	
	})(jQuery);
