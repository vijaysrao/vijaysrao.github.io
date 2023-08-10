var jco = null;
$(document).ready(function(){
	$.getJSON("data.json", function( jo ) {
        for(i = 0; i < jo.length; i++) {
            jco = jo[i]["coverage"];
        }
	});
});
function onClear () {
	document.getElementById("calc").innerHTML = '';
}
function onComputeEnergy () {
	onClear();

	var coverage = Number(document.getElementById("coverage").value);
	var uplink_data_size = Number(document.getElementById("up_data").value) + 70;
	var downlink_data_size = Number(document.getElementById("dn_data").value) + 52;
	var cdrx_time = Number(document.getElementById("cdrx_time").value);
	var cdrx_dc = Number(document.getElementById("cdrx_dc").value);
	var idrx_time = Number(document.getElementById("idrx_time").value);
	var idrx_dc = Number(document.getElementById("idrx_dc").value);
	var freq = Number(document.getElementById("freq").value);

	if (uplink_data_size == 70) 
		uplink_data_size = 0;
	if (downlink_data_size == 52)
		downlink_data_size = 0;
		 
	try {
		var o = jco[coverage];
		var B_avg = o.tx_power_avg_case * o.num_rep_tx_preabmle_avg * 0.0064;
		var B_wc =  o.tx_power_worst_case * o.num_rep_tx_preamble_worst_case * 0.0064;
		
		var C_and_D_avg = (o.rx_power * o.num_rep_rx_DCIN1_C_avg * 0.001) + 
			(o.rx_power * o.num_rep_rx_D_avg * o.num_sub_frames_D_avg * 0.001);
		var C_and_D_worst_case = (o.rx_power * o.num_rep_rx_DCIN1_C_worst_case * 0.001) + 
			(o.rx_power * o.num_rep_rx_D_worst_case * o.num_sub_frames_D_worst_case * 0.001);

		/*	(o.tx_power_avg_case * o.npusch_f2_ru * 0.008) + 
		//C,D,F,G,I = RX_power * time (cell_coverage) (E_RX pg. 20)
		var C_avg = (o.rx_power * o.num_rep_rx * 0.001) + 
			(o.rx_power * o.num_rep_rx * o.num_sub_frames_rach * 0.001) +
			(o.tx_power_avg_case * o.npusch_f2_ru * 0.008) + 
			(o.light_sleep_power * o.sd_rx_time);
		var C_wc = (o.rx_power * o.num_rep_rx * 0.001) + 
			(o.rx_power * o.num_rep_rx * o.num_sub_frames_rach * 0.001) + 
			(o.tx_power_worst_case * o.npusch_f2_ru * 0.008) + 
			(o.light_sleep_power * o.sd_rx_time);
		*/
		// E,H = TX_power * time (cell_coverage) (use E_TX pg. 20); 
		var E_avg = (o.rx_power * o.num_rep_rx_DCIN1_C_avg * 0.001) + 
			(o.tx_power_avg_case * 0.008 * o.num_rep_tx_avg * o.num_sub_frames_E_avg) + 
			(o.light_sleep_power * o.sd_tx_time);
		var E_wc = (o.rx_power * o.num_rep_rx_DCIN1_C_worst_case * 0.001) + 
			(o.tx_power_worst_case * 0.008 * o.num_rep_tx_worst_case * o.num_sub_frames_E_worst_case) + 
			(o.light_sleep_power * o.sd_tx_time);
	
		var F_and_G_avg = (o.rx_power * o.num_rep_rx_DCIN1_F_avg * 0.001) + 
			(o.rx_power * o.num_rep_rx_G_avg * o.num_sub_frames_G_avg * 0.001);
		var F_and_G_worst_case = (o.rx_power * o.num_rep_rx_DCIN1_F_worst_case * 0.001) + 
			(o.rx_power * o.num_rep_rx_G_worst_case * o.num_sub_frames_G_worst_case * 0.001);

		var H_avg = (o.tx_power_avg_case * o.npusch_f2_ru * o.num_rep_tx_avg) +
			(o.light_sleep_power * o.sd_rx_time);
		var H_worst_case = (o.tx_power_worst_case * o.npusch_f2_ru * o.num_rep_tx_worst_case) +
			(o.light_sleep_power * o.sd_rx_time);

		var rach_energy_avg = B_avg + C_and_D_avg + E_avg + F_and_G_avg + H_avg;
		var rach_energy_wc = B_wc + C_and_D_worst_case + E_wc + F_and_G_worst_case + H_worst_case;

		var cdrx_energy = (o.rx_power * cdrx_time * cdrx_dc) + (o.light_sleep_power * cdrx_time * (1 - cdrx_dc));
		var idrx_energy = (o.rx_power * idrx_time * idrx_dc) + (0);

		var data_tx_energy_avg = (o.rx_power * o.num_rep_rx_DCIN0_I_avg * 0.001) + 
			(o.tx_power_avg_case * 0.008 * o.num_rep_tx_J_avg * uplink_data_size/o.bytes_per_TB_uplink_avg_case) + 
			(o.light_sleep_power * o.sd_tx_time);
		var data_tx_energy_wc = (o.rx_power * o.num_rep_rx_DCIN0_I_worst_case * 0.001) + 
			(o.tx_power_worst_case * 0.008 * o.num_rep_tx_J_worst_case * uplink_data_size/o.bytes_per_TB_uplink_worst_case) + 
			(o.light_sleep_power * o.sd_tx_time); 

		var data_rx_energy_avg = (o.rx_power * o.num_rep_rx_DCIN1_I_avg * 0.001) + 
			(o.rx_power * o.num_rep_rx_J_avg * downlink_data_size/o.bytes_per_TB_downlink_avg_case * 0.001) +
			H_avg;
		var data_rx_energy_wc = (o.rx_power * o.num_rep_rx_DCIN1_I_worst_case * 0.001) + 
			(o.rx_power * o.num_rep_rx_J_worst_case * downlink_data_size/o.bytes_per_TB_downlink_worst_case * 0.001) + 
			H_worst_case;
		
		var b_time_avg = (o.num_rep_tx_preabmle_avg * 0.0064);
		var c_d_time_avg = (o.num_rep_rx_DCIN1_C_avg * 0.001) + (o.num_rep_rx_D_avg * o.num_sub_frames_D_avg * 0.001);
		var e_time_avg = (o.num_rep_rx_DCIN1_C_avg * 0.001) + (0.008 * o.num_rep_tx_avg * o.num_sub_frames_E_avg) + 
			(o.sd_tx_time);
		var f_g_time_avg = (o.num_rep_rx_DCIN1_F_avg * 0.001) + (o.num_rep_rx_G_avg * o.num_sub_frames_G_avg * 0.001);
		var h_time_avg = (o.npusch_f2_ru * o.num_rep_tx_avg) + (o.sd_rx_time);
		var data_tx_time_avg = (o.num_rep_rx_DCIN0_I_avg * 0.001) + 
			(0.008 * o.num_rep_tx_J_avg * uplink_data_size/o.bytes_per_TB_uplink_avg_case) + 
			(o.sd_tx_time);
		var data_rx_time_avg = (o.num_rep_rx_DCIN1_I_avg * 0.001) + 
			(o.num_rep_rx_J_avg * downlink_data_size/o.bytes_per_TB_downlink_avg_case * 0.001) +
			h_time_avg;

		var total_time_avg_case = (o.abs_time_tx_final_avg_case - b_time_avg - c_d_time_avg - e_time_avg - f_g_time_avg -
			h_time_avg - data_tx_time_avg - data_rx_time_avg);
		
		var b_time_wc = o.num_rep_tx_preamble_worst_case * 0.0064;
		var c_d_time_wc = (o.num_rep_rx_DCIN1_C_worst_case * 0.001) + (o.num_rep_rx_D_worst_case * o.num_sub_frames_D_worst_case * 0.001);
		var e_time_wc = (o.num_rep_rx_DCIN1_C_worst_case * 0.001) + (0.008 * o.num_rep_tx_worst_case * o.num_sub_frames_E_worst_case) + 
			(o.sd_tx_time);	
		var f_g_time_wc = (o.num_rep_rx_DCIN1_F_worst_case * 0.001) + (o.num_rep_rx_G_worst_case * o.num_sub_frames_G_worst_case * 0.001);
		var h_time_wc = (o.npusch_f2_ru * o.num_rep_tx_worst_case) + (o.sd_rx_time);
		var data_tx_time_wc = (o.num_rep_rx_DCIN0_I_worst_case * 0.001) + 
			(0.008 * o.num_rep_tx_J_worst_case * uplink_data_size/o.bytes_per_TB_uplink_worst_case) + 
			(o.sd_tx_time);
		var data_rx_time_wc = (o.num_rep_rx_DCIN1_I_worst_case * 0.001) + 
			(o.num_rep_rx_J_worst_case * downlink_data_size/o.bytes_per_TB_downlink_worst_case * 0.001) + 
			h_time_wc;

		var total_time_wc_case = (o.abs_time_tx_final_worst_case - b_time_wc - c_d_time_wc - e_time_wc - f_g_time_wc -
			h_time_wc - data_tx_time_wc - data_rx_time_wc);

		var mon_energy_avg = Math.abs ((o.rx_power * total_time_avg_case));
		
		var mon_energy_wc = Math.abs ((o.rx_power * total_time_wc_case));
		
		//var mon_energy_avg = 0, mon_energy_wc = 0;
		var avg_energy = rach_energy_avg + data_tx_energy_avg + data_rx_energy_avg + mon_energy_avg + cdrx_energy + idrx_energy;
		var wc_energy = rach_energy_wc + data_rx_energy_wc + data_tx_energy_wc + mon_energy_wc + cdrx_energy + idrx_energy;

		var psm_time_avg = (24*60*60 - (freq * (o.abs_time_tx_final_avg_case + cdrx_time + idrx_time)));
		var psm_time_wc = (24*60*60 - (freq * (o.abs_time_tx_final_worst_case + cdrx_time + idrx_time)));

		var avg_energy_day = (psm_time_avg * o.psm_power) + (avg_energy * freq);
		var wc_energy_day = (psm_time_wc * o.psm_power) + (wc_energy * freq);
		
		var output_rach = '<div style="border: 2px">' +
			'RACH average energy: ' + rach_energy_avg.toFixed(3) + ' J <br/>' +
			'Average energy consumption per data session: ' + avg_energy.toFixed(3) + ' J <br/>' +
			'Average energy consumption per day (incl. PSM): <b>' + avg_energy_day.toFixed(3) + '</b> J <br/><br/>' +
			'RACH maximum energy: ' + rach_energy_wc.toFixed(3) + ' J <br/>' +
			'Maximum energy consumption per data session: ' + wc_energy.toFixed(3) + ' J <br/>' +
			'Maximum energy consumption per day (incl. PSM): <b>' + wc_energy_day.toFixed(3) + '</b> J' +
			'</div>';
	
		document.getElementById("calc").innerHTML = output_rach;
	}
	catch (err) {
		document.getElementById("calc").innerHTML = "Unable to download measurements! Retry after sometime.";
	}
}
function myFunction() {
var x, text;

// Get the value of the input field with id="numb"
x = document.getElementById("numb").value;

// If x is Not a Number or less than one or greater than 10
if (isNaN(x) || x < 1 || x > 10) {
text = "Input not valid";
} else {
text = "Input OK";
}
document.getElementById("calc").innerHTML = "aaaaaaaa<br/>bbbbb<br/>aaaaaaaa<br/>bbbbb<br/>aaaaaaaa<br/>bbbbb<br/>";
}