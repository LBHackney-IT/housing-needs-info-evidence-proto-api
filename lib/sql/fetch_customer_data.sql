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
  COUNT(*) as position
FROM
  wlapp
  LEFT JOIN lookup ON lookup.lu_ref = wlapp.wl_status
    AND lookup.lu_type = 'WLS'
  LEFT JOIN wlaneeds_cte ON wlaneeds_cte.app_ref = wlapp.app_ref
WHERE
        u_eff_band_date < @bandDate
  AND app_band = @appBand
  AND lookup.lu_desc LIKE 'Active%'
  AND wlaneeds_cte.bedrooms = @bedrooms
  