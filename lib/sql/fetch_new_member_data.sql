WITH
  wlaneeds_cte
  AS
  (
    SELECT
      wlaneeds.app_ref,
      MAX(r_to) AS bedrooms
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
  COUNT(*) as count
FROM
  wlapp
  LEFT JOIN wlaneeds_cte ON wlaneeds_cte.app_ref = wlapp.app_ref
  LEFT JOIN lookup ON lookup.lu_ref = wlapp.wl_status
    AND lookup.lu_type = 'WLS'
WHERE
      app_date > DateAdd (yy, - 1, GetDate ())
  AND app_date < GetDate ()
  AND lookup.lu_desc LIKE 'Active%'
  AND wlaneeds_cte.bedrooms IS NOT NULL
GROUP BY
      app_band,
      wlaneeds_cte.bedrooms
ORDER BY
      app_band,
      bedrooms