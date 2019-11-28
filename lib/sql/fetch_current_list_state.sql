WITH
  wlaneeds_cte
  AS
  (
    SELECT
      wlaneeds.app_ref,
      RTRIM(MAX(r_to)) AS bedrooms
    FROM
      wlaneeds
    WHERE
        field_ref = 'num_bedrooms'
    GROUP BY
        wlaneeds.app_ref
  )
SELECT
  app_band as band,
  wlaneeds_cte.bedrooms as bedrooms,
  count(*) AS count
FROM
  (SELECT CASE
      WHEN app_band = 'PRY' THEN 'HOM'
      ELSE app_band
      END as app_band, app_ref, wl_status
  from wlapp) as wlapp
  LEFT JOIN wlaneeds_cte ON wlaneeds_cte.app_ref = wlapp.app_ref
  LEFT JOIN lookup ON lookup.lu_ref = wlapp.wl_status
    AND lookup.lu_type = 'WLS'
WHERE
      lookup.lu_desc LIKE 'Active%'
  AND wlaneeds_cte.bedrooms IS NOT NULL
GROUP BY
      app_band,
      wlaneeds_cte.bedrooms
ORDER BY
      app_band DESC,
      wlaneeds_cte.bedrooms
      