<?php

$sql = "SELECT * FROM `rune-data` WHERE `time` BETWEEN date_sub(now(), INTERVAL 1 WEEK) and now();";


include 'database.php';
$db = new DataBase();
$data = $db->getResults($sql);
$db->close();

$finalData = array();
foreach ($data as $row){
  $finalData[] = $row;
}

$json = json_encode($finalData);

?>

<!DOCTYPE>

<html>

  <head>
    <title>Dofus Scraper!</title>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link charset="utf-8" rel="stylesheet" href="style.css">

    <script src="https://cdn.jsdelivr.net/npm/chart.js/dist/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
  </head>

  <body>

    <div style="
      display: flex;
      flex-direction: column;
      height: 95vh;
      width: 95vw;
    ">
      <input type="search" id="search-bar" placeholder="Rune Do Cri...">
      <canvas id="chart" style="
        position: relative;
        flex-grow: 1;
        min-height: 0;">
      </canvas>
    </div>

    <script charset="UTF-8" src="rune_data.json"></script>

    <script type="text/javascript" id="goodbye">
      raw_data = <?=$json?>;
      cleaned_data = {};

      const rune_id_to_name = {};
      for(const row of Object.values(rune_data)){
        rune_id_to_name[row.runeId_1] = row.runeName_1;
      }

      for(const row of raw_data){
        if(!(row.rune_id in cleaned_data)){
          var series = {
            label:  rune_id_to_name[row.rune_id],
            data: [],
            borderColor: 'rgb(1,0,0)',
            backgroundColor: 'rgba(1,0,0,0.5)',
          }
          cleaned_data[row.rune_id] = series;
        }
        var series = cleaned_data[row.rune_id];
        series.data.push({'x': row.time, 'y': row.price});
      }

      const chart_data = Object.values(cleaned_data);

      delete raw_data;
      delete cleaned_data;

      document.querySelector("#goodbye").remove();
    </script>



    <script type="text/javascript">
      const data_lines = chart_data.length;
      const colors = [];
      for(let i = 0; i < data_lines; i++){
        const hue = i/data_lines*360;
        chart_data[i].borderColor = `hsl(${hue}, 100%, 50%)`;
        chart_data[i].backgroundColor = `hsla(${hue}, 100%, 50%, 0.5)`;
      }

      console.log(1);
      const ctx = document.getElementById('#chart');
      const myChart = new Chart('chart', {
          type: 'line',
          data: {
              datasets: chart_data
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            showTooltips: true,
            multiTooltipTemplate: "<%= value %>",
          }
      });
    </script>

    <script type="text/javascript">
      const searchBar = document.querySelector("#search-bar");
      searchBar.addEventListener('input', updateSearch);
      console.log("Test??");
      function updateSearch(event) {
        const value = event.target.value.trim().toLowerCase();
        for(let i = 0; i < data_lines; i++){
          const label = myChart.getDatasetMeta(i).label.toLowerCase();
          // console.log(`${label} <--?- ${value}: ${label.includes(value)}`)
          myChart.setDatasetVisibility(i, label.includes(value));
        }
        myChart.update();
      }
    </script>

  </body>
</html>
